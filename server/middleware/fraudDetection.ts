import { Request, Response } from 'express';
import { db } from '../db';
import { profiles, dogListings, fraudDetectionEvents } from '@shared/schema';
import { eq, and, gte, desc, count } from 'drizzle-orm';
import crypto from 'crypto';

// Fraud detection configuration
export const fraudConfig = {
  // Risk score thresholds
  riskThresholds: {
    low: 30,
    medium: 50,
    high: 70,
    critical: 90
  },
  
  // Risk score increases for different events
  riskScores: {
    ipMismatch: 15,
    rapidLoginAttempts: 20,
    duplicateListing: 25,
    bannedKeywords: 15,
    paymentFraud: 40,
    suspiciousLocation: 10,
    rapidListingCreation: 20,
    imageReuse: 30
  },
  
  // Banned keywords that trigger fraud detection
  bannedKeywords: [
    // Scam indicators
    'guaranteed', 'no questions asked', 'cash only', 'western union',
    'money gram', 'wire transfer', 'urgent sale', 'must sell today',
    'leaving country', 'military deployment', 'divorce sale',
    
    // Fake legitimacy claims
    'akc registered', // when not actually registered
    'champion bloodline', // often fake
    'rare color', 'designer breed',
    
    // Suspicious contact methods
    'text only', 'email only', 'whatsapp only',
    
    // Price manipulation
    'price negotiable immediately', 'half price', 'steal',
    
    // Emotional manipulation
    'needs home urgently', 'sick owner', 'moving emergency'
  ],
  
  // Time-based detection windows
  timeWindows: {
    rapidLogin: 5 * 60 * 1000, // 5 minutes
    rapidListing: 30 * 60 * 1000, // 30 minutes
    suspiciousActivity: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// Extend Request interface to include fraud context
declare global {
  namespace Express {
    interface Request {
      fraudContext?: {
        userId?: string;
        ipAddress?: string;
        userAgent?: string;
        riskFactors?: string[];
      };
    }
  }
}

// Main fraud detection middleware
export const fraudDetectionMiddleware = async (req: Request, res: Response, next: () => void) => {
  try {
    // Extract user context
    const userId = req.user?.id;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Initialize fraud context
    req.fraudContext = {
      userId,
      ipAddress,
      userAgent,
      riskFactors: []
    };
    
    // Only run fraud detection for authenticated users on sensitive operations
    if (userId && shouldRunFraudDetection(req)) {
      await detectFraudulentActivity(req);
    }
    
    next();
  } catch (error) {
    console.error('Fraud detection middleware error:', error);
    // Don't block the request if fraud detection fails
    next();
  }
};

// Determine if fraud detection should run for this request
function shouldRunFraudDetection(req: Request): boolean {
  const sensitiveRoutes = [
    '/api/listings', // Creating/updating listings
    '/api/messages', // Sending messages
    '/api/profiles', // Profile updates
    '/api/user/login', // Login attempts
    '/api/transactions' // Payment operations
  ];
  
  return sensitiveRoutes.some(route => req.path.includes(route)) ||
         req.method === 'POST' ||
         req.method === 'PUT';
}

// Core fraud detection logic
async function detectFraudulentActivity(req: Request): Promise<void> {
  const { userId, ipAddress, userAgent } = req.fraudContext!;
  let totalRiskScore = 0;
  const riskFactors: string[] = [];
  
  try {
    // Get user profile
    const [userProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId!));
    
    if (!userProfile) return;
    
    // 1. Check for IP address mismatches
    if (userProfile.last_login_ip && userProfile.last_login_ip !== ipAddress) {
      totalRiskScore += fraudConfig.riskScores.ipMismatch;
      riskFactors.push('ip_mismatch');
    }
    
    // 2. Check for rapid login attempts
    const recentLoginAttempts = await checkRapidLoginAttempts(userId!, ipAddress!);
    if (recentLoginAttempts > 3) {
      totalRiskScore += fraudConfig.riskScores.rapidLoginAttempts;
      riskFactors.push('rapid_login_attempts');
    }
    
    // 3. Check for duplicate listings (if creating/updating listing)
    if (req.path.includes('/api/listings') && req.method === 'POST') {
      const duplicateScore = await checkDuplicateListings(userId!, req.body);
      totalRiskScore += duplicateScore;
      if (duplicateScore > 0) {
        riskFactors.push('duplicate_listing');
      }
    }
    
    // 4. Check for banned keywords in content
    const keywordScore = checkBannedKeywords(req.body);
    totalRiskScore += keywordScore;
    if (keywordScore > 0) {
      riskFactors.push('banned_keywords');
    }
    
    // 5. Check for rapid listing creation
    if (req.path.includes('/api/listings') && req.method === 'POST') {
      const rapidListingScore = await checkRapidListingCreation(userId!);
      totalRiskScore += rapidListingScore;
      if (rapidListingScore > 0) {
        riskFactors.push('rapid_listing_creation');
      }
    }
    
    // 6. Update fraud context
    req.fraudContext!.riskFactors = riskFactors;
    
    // 7. Process fraud score if significant risk detected
    if (totalRiskScore > 0) {
      await processFraudScore(userId!, totalRiskScore, riskFactors, req);
    }
    
    // 8. Update user's last login IP
    if (req.path.includes('login') || req.method === 'GET') {
      await db
        .update(profiles)
        .set({ last_login_ip: ipAddress })
        .where(eq(profiles.id, userId!));
    }
    
  } catch (error) {
    console.error('Error in fraud detection:', error);
  }
}

// Check for rapid login attempts from different IPs
async function checkRapidLoginAttempts(userId: string, currentIp: string): Promise<number> {
  const timeThreshold = new Date(Date.now() - fraudConfig.timeWindows.rapidLogin);
  
  const recentEvents = await db
    .select()
    .from(fraudDetectionEvents)
    .where(
      and(
        eq(fraudDetectionEvents.user_id, userId),
        eq(fraudDetectionEvents.event_type, 'login_attempt'),
        gte(fraudDetectionEvents.created_at, timeThreshold)
      )
    );
  
  return recentEvents.length;
}

// Check for duplicate listings
async function checkDuplicateListings(userId: string, listingData: any): Promise<number> {
  if (!listingData.dog_name || !listingData.description) return 0;
  
  try {
    // Check for similar titles or descriptions
    const similarListings = await db
      .select()
      .from(dogListings)
      .where(eq(dogListings.user_id, userId));
    
    const duplicateCount = similarListings.filter(listing => {
      const titleSimilarity = calculateStringSimilarity(
        listingData.dog_name.toLowerCase(),
        listing.dog_name?.toLowerCase() || ''
      );
      const descSimilarity = calculateStringSimilarity(
        listingData.description.toLowerCase(),
        listing.description?.toLowerCase() || ''
      );
      
      return titleSimilarity > 0.8 || descSimilarity > 0.7;
    }).length;
    
    return duplicateCount > 0 ? fraudConfig.riskScores.duplicateListing : 0;
    
  } catch (error) {
    console.error('Error checking duplicate listings:', error);
    return 0;
  }
}

// Check for banned keywords in content
function checkBannedKeywords(data: any): number {
  if (!data) return 0;
  
  const content = JSON.stringify(data).toLowerCase();
  const foundKeywords = fraudConfig.bannedKeywords.filter(keyword => 
    content.includes(keyword.toLowerCase())
  );
  
  return foundKeywords.length > 0 ? fraudConfig.riskScores.bannedKeywords : 0;
}

// Check for rapid listing creation
async function checkRapidListingCreation(userId: string): Promise<number> {
  const timeThreshold = new Date(Date.now() - fraudConfig.timeWindows.rapidListing);
  
  try {
    const recentListings = await db
      .select({ count: count() })
      .from(dogListings)
      .where(
        and(
          eq(dogListings.user_id, userId),
          gte(dogListings.created_at, timeThreshold)
        )
      );
    
    const listingCount = recentListings[0]?.count || 0;
    return listingCount > 3 ? fraudConfig.riskScores.rapidListingCreation : 0;
    
  } catch (error) {
    console.error('Error checking rapid listing creation:', error);
    return 0;
  }
}

// Process and store fraud score
async function processFraudScore(
  userId: string, 
  riskScore: number, 
  riskFactors: string[], 
  req: Request
): Promise<void> {
  try {
    // Get current user profile
    const [currentProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId));
    
    if (!currentProfile) return;
    
    // Calculate new fraud score (cumulative but capped at 100)
    const newFraudScore = Math.min(100, (currentProfile.fraud_score || 0) + riskScore);
    
    // Determine action based on fraud score
    let autoAction = 'none';
    let newStatus = currentProfile.profile_status || 'active';
    
    if (newFraudScore >= fraudConfig.riskThresholds.critical) {
      autoAction = 'suspended';
      newStatus = 'suspended';
    } else if (newFraudScore >= fraudConfig.riskThresholds.high) {
      autoAction = 'under_review';
      newStatus = 'under_review';
    } else if (newFraudScore >= fraudConfig.riskThresholds.medium) {
      autoAction = 'flagged';
    }
    
    // Update user profile
    await db
      .update(profiles)
      .set({
        fraud_score: newFraudScore,
        profile_status: newStatus,
        suspicious_activity_count: (currentProfile.suspicious_activity_count || 0) + 1
      })
      .where(eq(profiles.id, userId));
    
    // Log fraud detection event
    await db
      .insert(fraudDetectionEvents)
      .values({
        id: crypto.randomUUID(),
        user_id: userId,
        event_type: riskFactors[0] || 'suspicious_activity',
        risk_score: riskScore,
        detection_method: 'automated',
        details: {
          risk_factors: riskFactors,
          total_fraud_score: newFraudScore,
          request_path: req.path,
          request_method: req.method,
          request_body_size: JSON.stringify(req.body || {}).length
        },
        ip_address: req.fraudContext?.ipAddress,
        user_agent: req.fraudContext?.userAgent,
        auto_action_taken: autoAction
      });
    
    // Log to console for monitoring
    console.warn(`Fraud detection triggered for user ${userId}:`, {
      risk_score: riskScore,
      total_fraud_score: newFraudScore,
      risk_factors: riskFactors,
      auto_action: autoAction,
      ip_address: req.fraudContext?.ipAddress,
      timestamp: new Date().toISOString()
    });
    
    // Set response headers to inform frontend
    if (req.res) {
      req.res.setHeader('X-Fraud-Score', newFraudScore.toString());
      req.res.setHeader('X-Profile-Status', newStatus);
    }
    
  } catch (error) {
    console.error('Error processing fraud score:', error);
  }
}

// Utility function to calculate string similarity
function calculateStringSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

// Levenshtein distance calculation
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Profile status checker middleware
export const checkProfileStatus = async (req: Request, res: Response, next: () => void) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return next();
  }
  
  try {
    const [userProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId));
    
    if (userProfile?.profile_status === 'suspended') {
      return res.status(403).json({
        error: 'Account Suspended',
        message: 'Your account has been suspended due to suspicious activity.',
        profile_status: 'suspended',
        fraud_score: userProfile.fraud_score
      });
    }
    
    if (userProfile?.profile_status === 'under_review') {
      // Allow read operations but block creates/updates
      if (req.method !== 'GET') {
        return res.status(403).json({
          error: 'Account Under Review',
          message: 'Your account is under review. New listings and updates are temporarily disabled.',
          profile_status: 'under_review',
          fraud_score: userProfile.fraud_score
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Error checking profile status:', error);
    next();
  }
};

// Export configuration for easy updates
export const updateFraudConfig = (newConfig: Partial<typeof fraudConfig>) => {
  Object.assign(fraudConfig, newConfig);
};