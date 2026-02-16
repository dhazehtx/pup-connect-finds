import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupSocketIO } from "./socket";
import { db } from "./db";
import { sql, inArray } from "drizzle-orm";
import { profiles, dogListings } from "@shared/schema";
import savedPostsRouter from './routes/saved-posts';
import bookmarksRouter from './routes/bookmarks';
import reportsRouter from './routes/reports';
import followsRouter from './routes/follows';
import notificationsRouter from './routes/notifications';
import communityRouter from './routes/community';
import groupPostsRouter from './routes/group-posts';
import supportRouter from './routes/support';
import bugsRouter from './routes/bugs';
import authRouter from './routes/auth';
import productsRouter from './routes/products';
import checkoutRouter from './routes/checkout';
import ordersRouter from './routes/orders';
import webhookRouter from './routes/webhook';
import adminRouter from './routes/admin';
import adminDashboardRouter from './routes/adminDashboard';
import analyticsRouter from './routes/analytics';
import reviewsRouter from './routes/reviews';
import servicesRouter from './routes/services';
import qaRouter from './routes/qa';
import monetizationRouter from './routes/monetization';
import providerApplicationsRouter from './routes/providerApplications';
import enhancedNotificationsRouter from './routes/enhancedNotifications';
import verificationRouter from './routes/verification';
import profilesRouter from './routes/profiles';
import paymentsRouter from './routes/payments';
import bookingsRouter from './routes/bookings';
import payoutsRouter from './routes/payouts';
import { registerHealthRoutes } from './routes/health';
import consentRouter from './routes/consent';
import consentGetRouter from './routes/consent-get';
import uploadIdRouter from './routes/upload-id';

// New Stripe verification system
import { startVerificationRouter } from './routes/verification/start';
import { progressRouter } from './routes/applications/progress';
import { submitRouter } from './routes/applications/submit';
import { webhookRouter as stripeWebhookRouter } from './routes/stripe/webhook';
import { verifyPayout } from './routes/payout/verify';
import { storage } from "./storage";
import { 
  generalRateLimit, 
  strictRateLimit, 
  authRateLimit, 
  messagingRateLimit, 
  listingRateLimit,
  speedLimiter,
  checkLockout,
  getAbuseStats
} from "./middleware/rateLimiting";

// Error handling middleware
import { globalErrorHandler, notFoundHandler, asyncHandler } from './middleware/errorHandler';

// Logging routes
import logsRouter from './routes/logs';

// Logging middleware
import { apiLoggingMiddleware, performanceLogger } from './middleware/loggingMiddleware';

// Session timeout middleware
import { sessionTimeout, lightSessionCheck } from './middleware/sessionTimeout';

// Authentication middleware
import { authMiddleware } from './middleware/auth';
import { requireAdmin } from './middleware/requireAdmin';

// Admin logging utilities
import { logPostAction, logCommentAction, logSubscriptionAction } from './utils/adminLogger';

// GDPR routes
import { registerGDPRRoutes } from './routes/gdpr';

// Security and performance middleware
import { compressionMiddleware } from './middleware/compression';
import { securityMiddleware, additionalSecurityHeaders } from './middleware/security';

// AI Content Moderation
import { contentModerationMiddleware } from './utils/aiModeration';

// Stripe initialization
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
});

import { 
  insertProfileSchema, 
  insertDogListingSchema, 
  insertMessageSchema,
  insertConversationSchema,
  insertFavoriteSchema,
  insertReviewSchema,
  insertPostSchema,
  insertCommentSchema,
  insertCommentReplySchema,
  insertNotificationSchema,
  insertTransactionSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply security and performance middleware first
  app.use(securityMiddleware); // Security headers and CSP
  app.use(additionalSecurityHeaders); // Custom security headers
  app.use(compressionMiddleware); // Gzip compression

  // 🔐 Mount consent endpoints BEFORE rate limiters (requires JSON body parsing from server/index.ts)
  app.use('/api', consentRouter);
  app.use('/api', consentGetRouter);

  // Apply global middleware
  app.use(checkLockout); // Check for locked out IPs/users
  app.use(speedLimiter); // Gradual slowdown for high-frequency requests
  app.use(generalRateLimit); // Apply general rate limiting to all routes
  
  // Add comprehensive logging middleware
  app.use(apiLoggingMiddleware); // Log all API requests
  app.use(performanceLogger(2000)); // Log slow responses (>2s)
  
  // Add AI content moderation
  app.use(contentModerationMiddleware); // Moderate user-generated content
  
  // Register store/ecommerce routes first (before auth middleware for public product listing)
  app.use('/api/products', productsRouter);
  app.use('/api/checkout', checkoutRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/services', servicesRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/admin/dashboard', adminDashboardRouter);
  app.use('/api/admin/analytics', analyticsRouter);
  
  // Admin provider management routes (protected by requireAdmin middleware)
  const { default: adminProvidersRouter } = await import('./routes/admin/providers.js');
  app.use('/api/admin/providers', adminProvidersRouter);
  
  // Admin queue routes (protected by requireAdmin middleware)
  const { default: adminQueueRouter } = await import('./routes/admin/queue.js');
  app.use('/api/admin/queue', adminQueueRouter);
  app.use('/api/webhook', webhookRouter);
  app.use('/api/qa', qaRouter);
  
  // Verification routes (temporarily public to bypass auth issues)
  app.use('/api/verification', verificationRouter);
  
  // ID verification upload route (uses auth middleware)
  const { default: verifyRouter } = await import('./routes/verify.js');
  app.use('/api/verify', verifyRouter);
  
  // ID document upload endpoints (uses service role to bypass RLS)
  app.use('/api/upload-id', uploadIdRouter);
  
  // Provider ID verification routes (temporarily public to bypass auth issues)
  const { linkIdMedia } = await import('./routes/providers/id/link-media.js');
  const { handleSimpleWebhook } = await import('./routes/providers/id/webhook.js');
  app.post('/api/providers/id/link-media', linkIdMedia);
  app.post('/api/providers/id/webhook', handleSimpleWebhook);

  // Stripe onboarding return route (public - no auth required)
  app.get('/services/onboarding', (req, res) => {
    const { from, step } = req.query;
    
    res.send(`
      <html>
        <head>
          <title>Onboarding Complete</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              text-align: center; 
              padding: 2rem; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              padding: 3rem 2rem;
              border-radius: 16px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              max-width: 500px;
              width: 100%;
            }
            h1 { 
              color: #2d3748; 
              margin-bottom: 1rem; 
              font-size: 2rem; 
            }
            p { 
              color: #4a5568; 
              margin-bottom: 2rem; 
              font-size: 1.1rem; 
              line-height: 1.6; 
            }
            .success-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
              color: #48bb78;
            }
            a { 
              display: inline-block;
              background: #4299e1;
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              transition: background 0.2s;
            }
            a:hover {
              background: #3182ce;
            }
            .subtitle {
              color: #718096;
              font-size: 0.9rem;
              margin-top: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h1>Stripe Onboarding Complete</h1>
            <p>Congratulations! Your Stripe account has been successfully connected. You can now receive payouts for your services.</p>
            <a href="/">Return to Dashboard</a>
            <p class="subtitle">Your banking information is securely managed by Stripe</p>
          </div>
        </body>
      </html>
    `);
  });

  // Add authentication middleware for all other API routes
  app.use('/api', authMiddleware);

  // Provider onboarding routes (protected by auth middleware)
  const { default: providersRouter } = await import('./routes/providers/onboarding.js');
  app.use('/api/providers', providersRouter);
  
  // Provider document management routes (protected by auth middleware)
  const { default: providerDocsRouter } = await import('./routes/provider/docs.js');
  app.use('/api/provider', providerDocsRouter);

  // Provider submit route (protected by auth middleware)
  const { default: providerSubmitRouter } = await import('./routes/provider/submit.js');
  app.use('/api/provider/submit', providerSubmitRouter);
  
  // Legal requirements routes (public for pre-validation)
  const { default: legalRequirementsRouter } = await import('./routes/legal/requirements.js');
  app.use('/api/legal', legalRequirementsRouter);
  
  // Provider applications routes (protected by auth middleware)
  app.use('/api/provider-applications', providerApplicationsRouter);
  app.use('/api/admin/service-applications', requireAdmin, providerApplicationsRouter);
  
  // Notifications routes (protected by auth middleware)
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/notifications-v2', enhancedNotificationsRouter);

  // Register GDPR compliance routes
  registerGDPRRoutes(app);

  // Profile routes (Neon/Drizzle)
  app.use('/api/profiles', profilesRouter);

  // Legacy profile routes (kept for backwards compatibility)
  app.get("/api/profile/:id", async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error getting profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/profiles", async (req, res) => {
    try {
      const validatedData = insertProfileSchema.parse(req.body);
      const profile = await storage.createProfile(validatedData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/profile/:id", async (req, res) => {
    try {
      const validatedData = insertProfileSchema.partial().parse(req.body);
      const profile = await storage.updateProfile(req.params.id, validatedData);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Dog listing routes (with rate limiting for creation)
  const handleListingsQuery = async (req: any, res: any) => {
    try {
      const { breed, minPrice, maxPrice, location, status, userId, min_price, max_price, min_age, max_age, gender, verified_only, health_tested, vaccinated, breeds, search, sort, offset, limit, good_with_kids, neutered_spayed, color } = req.query;
      const filters = {
        breed: (breed as string) || (search as string),
        breeds: breeds ? (breeds as string).split(',') : undefined,
        minPrice: minPrice ? parseFloat(minPrice as string) : min_price ? parseFloat(min_price as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : max_price ? parseFloat(max_price as string) : undefined,
        minAge: min_age ? parseInt(min_age as string) : undefined,
        maxAge: max_age ? parseInt(max_age as string) : undefined,
        location: location as string,
        gender: gender as string,
        color: color as string,
        status: (status as string) || 'active',
        userId: userId as string,
        verifiedOnly: verified_only === 'true',
        healthTested: health_tested === 'true',
        vaccinated: vaccinated === 'true',
        goodWithKids: good_with_kids === 'true',
        neuteredSpayed: neutered_spayed === 'true',
        sort: sort as string,
        offset: offset ? parseInt(offset as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };
      
      const listings = await storage.getDogListings(filters);
      console.log('[PROOF:LISTINGS]', JSON.stringify({ count: listings.length, filters: { breed: filters.breed, status: filters.status, location: filters.location, gender: filters.gender, sort: filters.sort } }));
      res.json(listings);
    } catch (error) {
      console.error("Error getting listings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  app.get("/api/listings", handleListingsQuery);
  app.get("/api/dog-listings/search", handleListingsQuery);

  // Get user's specific listings
  app.get("/api/listings/user/:userId", async (req, res) => {
    try {
      const { status } = req.query;
      const filters = {
        userId: req.params.userId,
        status: status as string,
      };
      
      console.log('[API] Fetching user listings with filters:', filters);
      const listings = await storage.getDogListings(filters);
      console.log('[API] Found', listings.length, 'user listings');
      res.json(listings);
    } catch (error) {
      console.error("Error getting user listings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
    try {
      const listing = await storage.getDogListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      let sellerProfile = null;
      if (listing.user_id) {
        sellerProfile = await storage.getProfile(listing.user_id);
      }
      res.json({
        ...listing,
        profiles: sellerProfile ? {
          id: sellerProfile.id,
          full_name: sellerProfile.full_name,
          username: sellerProfile.username,
          avatar_url: sellerProfile.avatar_url,
          location: sellerProfile.location,
          created_at: sellerProfile.created_at,
          rating: sellerProfile.rating,
          total_reviews: sellerProfile.total_reviews,
        } : null,
      });
    } catch (error) {
      console.error("Error getting listing:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/listings", listingRateLimit, async (req, res) => {
    try {
      const validatedData = insertDogListingSchema.parse(req.body);
      const listing = await storage.createDogListing(validatedData);
      res.json(listing);
    } catch (error) {
      console.error("Error creating listing:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/listings/:id", async (req, res) => {
    try {
      const validatedData = insertDogListingSchema.partial().parse(req.body);
      const listing = await storage.updateDogListing(req.params.id, validatedData);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      res.json(listing);
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/listings/:id", async (req, res) => {
    try {
      const success = await storage.deleteDogListing(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Listing not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting listing:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Conversation routes
  app.get("/api/conversations/:userId", async (req, res) => {
    try {
      const conversations = await storage.getUserConversations(req.params.userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error getting conversations:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/messaging/conversations", async (req, res) => {
    try {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });
      }
      const userId = req.user!.id;

      const { ensureProfile } = await import('./lib/ensureProfile');
      try {
        await ensureProfile({ id: userId, email: req.user!.email || null, username: req.user!.username || null });
      } catch (epErr: any) {
        console.error('[PROOF:MSG:ERR] ensureProfile in conversations list', epErr?.message);
      }

      const convList = await storage.getUserConversationsWithDetails(userId);
      console.log('[PROOF:MSG:LIST]', JSON.stringify({ actorUserId: userId, count: convList.length }));
      res.json(convList);
    } catch (error: any) {
      console.error('[PROOF:MSG:ERR] conversations list', error?.message);
      res.json([]);
    }
  });

  app.get("/api/messaging/conversations/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const userId = req.user!.id;
      const detail = await storage.getConversationDetail(req.params.id, userId);
      if (!detail) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(detail);
    } catch (error: any) {
      console.error('[PROOF:CONV_DETAIL] error', JSON.stringify({ convId: req.params.id, userId: req.user?.id, error: error?.message, stack: error?.stack }));
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const UUID_RE_MSG = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  app.post("/api/messaging/conversations/find-or-create", messagingRateLimit, async (req, res) => {
    const bodyKeys = Object.keys(req.body || {});
    const targetUserId_raw = req.body?.seller_id || req.body?.participant_id || req.body?.target_id || req.body?.targetUserId;
    console.log('[PROOF:MSG:IN]', JSON.stringify({ actorUserId: req.user?.id, targetUserId: targetUserId_raw, bodyKeys }));
    try {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ ok: false, error: 'Unauthorized', code: 'AUTH_REQUIRED' });
      }

      const actorUserId = req.user!.id;

      const { ensureProfile } = await import('./lib/ensureProfile');
      try {
        await ensureProfile({
          id: actorUserId,
          email: req.user!.email || null,
          username: req.user!.username || null,
        });
      } catch (epErr: any) {
        console.error('[PROOF:MSG:ERR] ensureProfile failed', epErr?.message);
        return res.status(422).json({ ok: false, error: 'Failed to initialize user profile', code: 'PROFILE_INIT_FAILED' });
      }

      const targetUserId = req.body.seller_id || req.body.participant_id || req.body.target_id || req.body.targetUserId;
      const listing_id = req.body.listing_id;

      if (!targetUserId || typeof targetUserId !== 'string') {
        return res.status(400).json({ ok: false, error: 'seller_id, participant_id, or target_id is required', code: 'MISSING_TARGET' });
      }

      if (!UUID_RE_MSG.test(targetUserId)) {
        return res.status(400).json({ ok: false, error: 'Target ID must be a valid UUID', code: 'INVALID_UUID' });
      }

      if (targetUserId === actorUserId) {
        return res.status(400).json({ ok: false, error: 'Cannot message yourself', code: 'SELF_MESSAGE' });
      }

      const targetProfile = await storage.getProfile(targetUserId);
      if (!targetProfile) {
        return res.status(404).json({ ok: false, error: 'Target profile not found', code: 'TARGET_NOT_FOUND' });
      }

      const conversation = await storage.findOrCreateConversation(actorUserId, targetUserId, listing_id || null);
      const conversationId = conversation.id;
      console.log('[PROOF:MSG:OK]', JSON.stringify({ conversationId, created: conversation.created }));
      res.json({ ok: true, conversationId, id: conversationId, created: conversation.created });
    } catch (error: any) {
      console.error('[PROOF:MSG:ERR]', JSON.stringify({
        actorUserId: req.user?.id,
        targetUserId: targetUserId_raw,
        message: error?.message,
        code: error?.code,
      }));
      if (error?.code === '23503') {
        res.status(404).json({ ok: false, error: 'Referenced profile not found in database', code: 'FK_VIOLATION' });
      } else if (error?.code === '23505') {
        res.status(409).json({ ok: false, error: 'Duplicate conversation participant', code: 'DUPLICATE_PARTICIPANT' });
      } else {
        res.status(422).json({ ok: false, error: error?.message || 'Conversation creation failed', code: 'CONVERSATION_FAILED' });
      }
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Message routes
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const before = req.query.before as string | undefined;
      const msgs = before
        ? await storage.getConversationMessagesPaginated(req.params.id, limit, before)
        : await storage.getConversationMessagesPaginated(req.params.id, limit);
      msgs.reverse();
      res.json(msgs);
    } catch (error) {
      console.error("Error getting messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/messaging/conversations/:id/messages", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const token = authHeader.substring(7);
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: 'Server misconfiguration' });
      }
      const sb = createClient(supabaseUrl, supabaseServiceKey);
      const { data: { user }, error: authError } = await sb.auth.getUser(token);
      if (authError || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      const limit = parseInt(req.query.limit as string) || 50;
      const before = req.query.before as string | undefined;
      const msgs = before
        ? await storage.getConversationMessagesPaginated(req.params.id, limit, before)
        : await storage.getConversationMessagesPaginated(req.params.id, limit);
      msgs.reverse();

      const senderIds = Array.from(new Set(msgs.map(m => m.sender_id).filter(Boolean))) as string[];
      let profilesMap: Record<string, any> = {};
      if (senderIds.length > 0) {
        const profs = await db.select({
          id: profiles.id,
          full_name: profiles.full_name,
          username: profiles.username,
          email: profiles.email,
          avatar_url: profiles.avatar_url,
        }).from(profiles).where(inArray(profiles.id, senderIds));
        profs.forEach(p => { profilesMap[p.id] = p; });
      }
      const messagesWithProfiles = msgs.map(m => ({
        ...m,
        sender_profile: m.sender_id ? profilesMap[m.sender_id] || null : null,
      }));
      res.json(messagesWithProfiles);
    } catch (error) {
      console.error("Error getting messages with profiles:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/messaging/messages", messagingRateLimit, async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const token = authHeader.substring(7);
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: 'Server misconfiguration' });
      }
      const sb = createClient(supabaseUrl, supabaseServiceKey);
      const { data: { user }, error: authError } = await sb.auth.getUser(token);
      if (authError || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      const { conversation_id, content } = req.body;
      if (!conversation_id || !content) {
        return res.status(400).json({ error: 'conversation_id and content are required' });
      }
      const message = await storage.createMessageWithProfile({
        conversation_id,
        sender_id: user.id,
        content: content.trim(),
      });
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/messaging/conversations/:id/mark-read", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const token = authHeader.substring(7);
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: 'Server misconfiguration' });
      }
      const sb = createClient(supabaseUrl, supabaseServiceKey);
      const { data: { user }, error: authError } = await sb.auth.getUser(token);
      if (authError || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      await storage.markMessagesAsRead(req.params.id, user.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/messaging/unread-count", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const token = authHeader.substring(7);
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: 'Server misconfiguration' });
      }
      const sb = createClient(supabaseUrl, supabaseServiceKey);
      const { data: { user }, error: authError } = await sb.auth.getUser(token);
      if (authError || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      const count = await storage.getUnreadCount(user.id);
      res.json({ count });
    } catch (error) {
      console.error("Error getting unread count:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/messaging/search", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const token = authHeader.substring(7);
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: 'Server misconfiguration' });
      }
      const sb = createClient(supabaseUrl, supabaseServiceKey);
      const { data: { user }, error: authError } = await sb.auth.getUser(token);
      if (authError || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      const results = await storage.searchMessages(user.id, query);
      res.json(results);
    } catch (error) {
      console.error("Error searching messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/messages", messagingRateLimit, async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Favorites routes
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const favorites = await storage.getUserFavorites(req.params.userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error getting favorites:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const validatedData = insertFavoriteSchema.parse(req.body);
      const favorite = await storage.addFavorite(validatedData);
      res.json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/favorites/:userId/:listingId", async (req, res) => {
    try {
      const success = await storage.removeFavorite(req.params.userId, req.params.listingId);
      if (!success) {
        return res.status(404).json({ error: "Favorite not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/favorites/check/:listingId", async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.json({ isFavorited: false });
      const isFavorited = await storage.checkFavorite(userId, req.params.listingId);
      res.json({ isFavorited });
    } catch (error) {
      console.error("Error checking favorite:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/favorites/count/:listingId", async (req, res) => {
    try {
      const count = await storage.getFavoriteCount(req.params.listingId);
      res.json({ count });
    } catch (error) {
      console.error("Error getting favorite count:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/favorites/ids/:userId", async (req, res) => {
    try {
      const ids = await storage.getUserFavoriteIds(req.params.userId);
      res.json({ ids });
    } catch (error) {
      console.error("Error getting favorite ids:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Post likes routes
  app.get("/api/posts/:id/likes", async (req: any, res) => {
    try {
      const postId = req.params.id;
      const userId = req.user?.id;
      const count = await storage.getPostLikeCount(postId);
      const likedByUser = userId ? await storage.checkPostLike(postId, userId) : false;
      res.json({ count, likedByUser });
    } catch (error) {
      console.error("Error getting post likes:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/posts/:id/likes", async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      await storage.addPostLike(req.params.id, userId);
      const count = await storage.getPostLikeCount(req.params.id);
      res.json({ liked: true, count });
    } catch (error) {
      console.error("Error adding post like:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/posts/:id/likes", async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      await storage.removePostLike(req.params.id, userId);
      const count = await storage.getPostLikeCount(req.params.id);
      res.json({ liked: false, count });
    } catch (error) {
      console.error("Error removing post like:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Review routes
  app.get("/api/listings/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getListingReviews(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error getting reviews:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(validatedData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Posts routes (community features)
  app.get("/api/posts", async (req, res) => {
    try {
      const { category, userId, listingId } = req.query;
      const allPosts = await storage.getPosts(category as string);
      let filtered = allPosts;
      if (userId) {
        filtered = filtered.filter((p: any) => p.user_id === userId);
      }
      if (listingId) {
        filtered = filtered.filter((p: any) => p.listing_id === listingId);
      }
      res.json(filtered);
    } catch (error) {
      console.error("Error getting posts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get posts for authenticated user's home feed (followed users only, NOT own posts)
  app.get('/api/posts/home-feed', authMiddleware, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const feedPosts = await storage.getHomeFeedPosts(userId);
      res.json(feedPosts || []);
    } catch (error) {
      console.error('[API] Error fetching home feed:', error);
      res.status(500).json({ error: 'Failed to fetch home feed' });
    }
  });

  // Get single post by ID
  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPostWithProfile(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error getting post:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/posts", sessionTimeout, async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(validatedData);
      
      // Log admin action for post creation
      if (validatedData.user_id) {
        await logPostAction(validatedData.user_id, 'create', post.id);
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Comments routes
  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getPostComments(req.params.id);
      res.json(comments);
    } catch (error) {
      console.error("Error getting comments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/comments", sessionTimeout, async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(validatedData);
      
      // Log admin action for comment creation
      if (validatedData.user_id) {
        await logCommentAction(validatedData.user_id, 'create', comment.id);
      }
      
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update post
  app.patch("/api/posts/:id", async (req, res) => {
    try {
      const updated = await storage.updatePost(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete post
  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePost(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update comment
  app.patch("/api/comments/:id", async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }
      const updated = await storage.updateComment(req.params.id, content);
      if (!updated) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete comment
  app.delete("/api/comments/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteComment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get comment count for a post
  app.get("/api/posts/:id/comments/count", async (req, res) => {
    try {
      const count = await storage.getCommentCount(req.params.id);
      res.json({ count });
    } catch (error) {
      console.error("Error getting comment count:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Comment reply routes
  app.get("/api/comments/:id/replies", async (req, res) => {
    try {
      const replies = await storage.getCommentReplies(req.params.id);
      res.json(replies);
    } catch (error) {
      console.error("Error getting comment replies:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/comment-replies", async (req, res) => {
    try {
      const validatedData = insertCommentReplySchema.parse(req.body);
      const reply = await storage.createCommentReply(validatedData);
      res.json(reply);
    } catch (error) {
      console.error("Error creating comment reply:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


  // AI Image Analysis route (replaces Supabase Edge Function)
  app.post("/api/ai/image-analysis", async (req, res) => {
    try {
      const { imageUrl, listingId, analysisType = 'breed_detection' } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
      }

      // Note: This requires OPENAI_API_KEY environment variable
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
      }

      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: analysisType === 'breed_detection' 
                ? 'You are a professional dog breed identification expert. Analyze the image and provide breed identification with confidence scores. Return JSON format: {"breeds": [{"name": "breed_name", "confidence": 0.95, "characteristics": ["trait1", "trait2"]}], "mix_probability": 0.3, "age_estimate": "8-12 weeks", "size_category": "medium"}'
                : 'You are a veterinary expert analyzing puppy health from photos. Look for visible health indicators and return JSON: {"health_score": 0.85, "observations": ["clear eyes", "good posture"], "concerns": [], "recommendations": ["regular vet checkups"], "visible_issues": "none"}'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: analysisType === 'breed_detection' 
                    ? 'Please identify the dog breed(s) in this image with confidence scores and characteristics.'
                    : 'Please assess the visible health indicators of this puppy.'
                },
                {
                  type: 'image_url',
                  image_url: { url: imageUrl }
                }
              ]
            }
          ],
          max_tokens: 500
        }),
      });

      if (!openAIResponse.ok) {
        const error = await openAIResponse.json();
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }

      const openAIData = await openAIResponse.json();
      const analysisResult = openAIData.choices[0].message.content;

      let parsedResults;
      try {
        parsedResults = JSON.parse(analysisResult);
      } catch (e) {
        parsedResults = { raw_analysis: analysisResult };
      }

      const confidence = analysisType === 'breed_detection' 
        ? (parsedResults.breeds?.[0]?.confidence || 0.5)
        : (parsedResults.health_score || 0.5);

      res.json({
        success: true,
        analysis: parsedResults,
        confidence: confidence,
        listingId: listingId
      });
    } catch (error) {
      console.error('Error in AI image analysis:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'AI analysis failed',
        success: false 
      });
    }
  });

  // Marketplace bulk operations (replaces advanced-search Edge Function)
  app.post("/api/marketplace/bulk-update", async (req, res) => {
    try {
      const { listing_ids, updates, user_id } = req.body;

      // Verify user owns all listings
      const userListings = await storage.getDogListings({ userId: user_id });
      const userListingIds = userListings.map(l => l.id);
      
      const hasPermission = listing_ids.every((id: string) => userListingIds.includes(id));
      if (!hasPermission) {
        return res.status(403).json({ error: 'Some listings not found or not owned by user' });
      }

      // Perform bulk update
      const updatedListings = [];
      for (const id of listing_ids) {
        const updated = await storage.updateDogListing(id, updates);
        if (updated) updatedListings.push(updated);
      }

      res.json({
        success: true,
        updated_listings: updatedListings,
        count: updatedListings.length
      });
    } catch (error) {
      console.error('Error in bulk update:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Payment transaction routes
  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      console.error("Error getting transaction:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Stripe Payment Routes
  
  // Create payment intent for one-time purchases (Pup Box, Rehoming Feature)
  app.post("/api/payments/create-payment-intent", async (req, res) => {
    try {
      const { amount, currency = 'usd', productType, userId, metadata } = req.body;
      
      if (!amount || !productType || !userId) {
        return res.status(400).json({ error: 'Missing required fields: amount, productType, userId' });
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          userId,
          productType, // 'pup_box' or 'rehoming_feature'
          ...metadata,
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ error: 'Failed to create payment intent' });
    }
  });

  // Create subscription for Premium Plan
  app.post("/api/payments/create-subscription", async (req, res) => {
    try {
      const { userId, email, priceId = 'price_premium_monthly' } = req.body;
      
      if (!userId || !email) {
        return res.status(400).json({ error: 'Missing required fields: userId, email' });
      }

      // Create or retrieve customer
      let customer;
      try {
        const customers = await stripe.customers.list({
          email,
          limit: 1,
        });
        customer = customers.data[0];
      } catch (error) {
        console.log('No existing customer found');
      }

      if (!customer) {
        customer = await stripe.customers.create({
          email,
          metadata: {
            userId,
          },
        });
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId,
          plan: 'premium',
        },
      });

      const invoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = (invoice as any)?.payment_intent as Stripe.PaymentIntent;

      res.json({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
        customerId: customer.id,
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  });

  // Webhook to handle successful payments
  const stripeWebhookHandler = async (req: any, res: any) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig as string, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return res.status(400).send('Webhook signature verification failed');
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          
          // Record the transaction
          await storage.createTransaction({
            user_id: paymentIntent.metadata.userId,
            type: 'payment',
            amount: (paymentIntent.amount / 100).toString(), // Convert from cents to string
            currency: paymentIntent.currency,
            status: 'completed',
            payment_method: 'stripe',
            product_type: paymentIntent.metadata.productType || 'unknown',
            stripe_payment_intent_id: paymentIntent.id,
          });
          
          console.log('Payment successful:', paymentIntent.id);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          const subscription = event.data.object as Stripe.Subscription;
          
          // Update user's subscription status
          await storage.createTransaction({
            user_id: subscription.metadata.userId,
            type: 'subscription',
            amount: ((subscription.items.data[0].price.unit_amount || 0) / 100).toString(),
            currency: subscription.currency,
            status: subscription.status === 'active' ? 'completed' : 'pending',
            payment_method: 'stripe',
            product_type: 'premium_subscription',
            stripe_subscription_id: subscription.id,
          });
          
          // Log admin action for subscription creation/update
          if (subscription.metadata.userId) {
            const action = event.type === 'customer.subscription.created' ? 'create' : 'update';
            await logSubscriptionAction(subscription.metadata.userId, action, subscription.id);
          }
          
          console.log('Subscription updated:', subscription.id);
          break;

        case 'customer.subscription.deleted':
          const canceledSubscription = event.data.object as Stripe.Subscription;
          
          // Record subscription cancellation
          await storage.createTransaction({
            user_id: canceledSubscription.metadata.userId,
            type: 'subscription_cancel',
            amount: "0",
            currency: canceledSubscription.currency,
            status: 'completed',
            payment_method: 'stripe',
            product_type: 'premium_subscription',
            stripe_subscription_id: canceledSubscription.id,
          });
          
          // Log admin action for subscription cancellation
          if (canceledSubscription.metadata.userId) {
            await logSubscriptionAction(canceledSubscription.metadata.userId, 'delete', canceledSubscription.id);
          }
          
          console.log('Subscription canceled:', canceledSubscription.id);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error handling webhook:', error);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  };

  // Register webhook handlers on both paths
  app.post("/api/webhooks/stripe", stripeWebhookHandler);
  app.post("/api/payments/webhook", stripeWebhookHandler);

  // GDPR Data Export Route
  app.get("/api/export-data", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Get user profile
      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user's listings
      const listings = await storage.getUserListings(userId);
      
      // Get user's conversations and messages
      const conversations = await storage.getUserConversations(userId);
      const messages: any[] = [];
      
      for (const conversation of conversations) {
        const conversationMessages = await storage.getMessages(conversation.id);
        messages.push(...conversationMessages);
      }

      // Get user's posts and comments (if they exist in storage)
      let posts: any[] = [];
      let comments: any[] = [];
      
      try {
        // These methods might not exist in storage yet, so we wrap in try-catch
        posts = await storage.getUserPosts?.(userId) || [];
        comments = await storage.getUserComments?.(userId) || [];
      } catch (e) {
        console.log('Posts/comments retrieval not implemented yet');
      }

      // Get user's transactions
      const transactions = await storage.getUserTransactions(userId);

      // Bundle all user data
      const userData = {
        exportDate: new Date().toISOString(),
        user: {
          id: profile.id,
          email: profile.email,
          username: profile.username,
          full_name: profile.full_name,
          bio: profile.bio,
          location: profile.location,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        },
        listings: listings.map(listing => ({
          id: listing.id,
          title: listing.title,
          description: listing.description,
          price: listing.price,
          breed: listing.breed,
          created_at: listing.created_at
        })),
        conversations: conversations.map(conv => ({
          id: conv.id,
          participant_id: conv.participant_id,
          created_at: conv.created_at,
          updated_at: conv.updated_at
        })),
        messages: messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          created_at: msg.created_at,
          conversation_id: msg.conversation_id
        })),
        posts: posts,
        comments: comments,
        transactions: transactions.map(tx => ({
          id: tx.id,
          type: tx.type,
          amount: tx.amount,
          status: tx.status,
          created_at: tx.created_at
        }))
      };

      // Set headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="my-pup-data-${userId}-${Date.now()}.json"`);
      
      res.json(userData);
    } catch (error) {
      console.error('Error exporting user data:', error);
      res.status(500).json({ error: 'Failed to export user data' });
    }
  });

  // GDPR Account Deletion Route
  app.delete("/api/delete-account", async (req, res) => {
    try {
      const userId = req.body.userId as string;
      const confirmDelete = req.body.confirmDelete as boolean;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      if (!confirmDelete) {
        return res.status(400).json({ error: 'Account deletion must be confirmed' });
      }

      // Verify user exists
      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Start deletion process - this should be done in a transaction
      console.log(`Starting account deletion for user ${userId}`);

      // Delete user's messages first (due to foreign key constraints)
      const conversations = await storage.getUserConversations(userId);
      for (const conversation of conversations) {
        try {
          await storage.deleteConversation(conversation.id);
        } catch (e) {
          console.error('Error deleting conversation:', e);
        }
      }

      // Delete user's listings
      const listings = await storage.getUserListings(userId);
      for (const listing of listings) {
        try {
          await storage.deleteListing(listing.id);
        } catch (e) {
          console.error('Error deleting listing:', e);
        }
      }

      // Delete user's transactions
      const transactions = await storage.getUserTransactions(userId);
      for (const transaction of transactions) {
        try {
          await storage.deleteTransaction?.(transaction.id);
        } catch (e) {
          console.error('Error deleting transaction:', e);
        }
      }

      // Delete user's posts and comments (if methods exist)
      try {
        await storage.deleteUserPosts?.(userId);
        await storage.deleteUserComments?.(userId);
      } catch (e) {
        console.log('Posts/comments deletion not implemented yet');
      }

      // Finally, delete the user profile
      await storage.deleteProfile(userId);

      console.log(`Account deletion completed for user ${userId}`);
      
      res.json({ 
        success: true, 
        message: 'Account and all associated data have been permanently deleted' 
      });
    } catch (error) {
      console.error('Error deleting user account:', error);
      res.status(500).json({ error: 'Failed to delete user account' });
    }
  });

  // Admin Logs API - Get last 100 entries for admin dashboard
  app.get("/api/admin/logs", async (req, res) => {
    try {
      // Check if user is admin
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userProfile = await storage.getProfile(userId);
      if (!userProfile?.is_admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const logs = await storage.getAdminLogs(100);
      res.json(logs);
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      res.status(500).json({ error: 'Failed to fetch admin logs' });
    }
  });

  // Create Stripe checkout session for subscriptions
  app.post("/api/create-subscription-checkout", async (req, res) => {
    try {
      const { userId, productType, priceId, trialDays = 0 } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Get or create Stripe customer
      let customer;
      const user = await storage.getProfile(userId);
      if (!user?.email) {
        return res.status(400).json({ error: 'User email not found' });
      }

      const existingCustomers = await stripe.customers.list({
        email: user.email,
        limit: 1
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId }
        });
      }

      // Create checkout session
      const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        customer: customer.id,
        mode: 'subscription',
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        success_url: `${process.env.CLIENT_URL || 'http://localhost:5000'}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5000'}/subscription-cancelled`,
        metadata: {
          userId,
          productType
        }
      };

      if (trialDays > 0) {
        sessionConfig.subscription_data = {
          trial_period_days: trialDays
        };
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      res.json({ 
        sessionId: session.id,
        url: session.url 
      });
    } catch (error) {
      console.error('Error creating subscription checkout:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  });

  // Get user's subscription status
  app.get("/api/payments/subscription-status/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Get latest subscription transaction for user
      const subscriptions = await storage.getUserTransactions(userId, 'subscription');
      const activeSubscription = subscriptions.find(sub => 
        sub.status === 'completed' && sub.product_type === 'premium_subscription'
      );
      
      if (!activeSubscription || !activeSubscription.stripe_subscription_id) {
        return res.json({ 
          hasActiveSubscription: false,
          plan: 'free',
        });
      }

      // Verify with Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(
        activeSubscription.stripe_subscription_id!
      );

      res.json({
        hasActiveSubscription: stripeSubscription.status === 'active',
        plan: stripeSubscription.status === 'active' ? 'premium' : 'free',
        subscription: {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          current_period_end: (stripeSubscription as any).current_period_end,
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        },
      });
    } catch (error) {
      console.error('Error checking subscription status:', error);
      res.status(500).json({ error: 'Failed to check subscription status' });
    }
  });

  // Cancel subscription
  app.post("/api/payments/cancel-subscription", async (req, res) => {
    try {
      const { userId, subscriptionId } = req.body;
      
      if (!userId || !subscriptionId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Cancel subscription at period end
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      // Log admin action for subscription cancellation
      await logSubscriptionAction(userId, 'delete', subscriptionId);

      res.json({
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_end: (subscription as any).current_period_end,
        },
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  });

  // Get user's payment history
  app.get("/api/payments/history/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const transactions = await storage.getUserTransactions(userId);
      
      // Sort by creation date, most recent first
      transactions.sort((a, b) => 
        new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      );
      
      res.json(transactions);
    } catch (error) {
      console.error('Error getting payment history:', error);
      res.status(500).json({ error: 'Failed to get payment history' });
    }
  });

  // Add admin endpoints for abuse monitoring
  app.get('/api/admin/abuse-stats', getAbuseStats);

  // Breeds API endpoints
  app.get("/api/breeds", async (req, res) => {
    try {
      const breeds = await storage.getBreeds();
      res.json(breeds);
    } catch (error) {
      console.error("Error fetching breeds:", error);
      res.status(500).json({ error: "Failed to fetch breeds" });
    }
  });

  // Support preferences endpoints to prevent errors
  app.get('/api/support/preferences', authMiddleware, asyncHandler(async (req: any, res: any) => {
    try {
      const userId = req.query.user_id || req.user?.id;
      if (!userId) {
        return res.json({ theme: 'light', notifications: true, privacy_settings: {} }); // Return defaults instead of error
      }
      
      // Return default theme preferences
      res.json({ 
        user_id: userId, 
        theme: 'light',
        notifications: true,
        privacy_settings: {}
      });
    } catch (error) {
      console.error('Error fetching support preferences:', error);
      res.json({ theme: 'light', notifications: true, privacy_settings: {} }); // Return defaults on error
    }
  }));


  // Create Stripe checkout session
  app.post("/create-checkout-session", asyncHandler(async (req: any, res: any) => {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "My Pup Service Example",
              },
              unit_amount: 2000, // $20
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.BASE_URL}/success`,
        cancel_url: `${process.env.BASE_URL}/cancel`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe error:", error);
      res.status(500).json({ error: error.message });
    }
  }));

  // Add logging routes
  app.use('/api/logs', logsRouter);

  // Simple debug verification endpoint
  app.post('/api/debug-verification', (req, res) => {
    console.log('[DEBUG VERIFICATION] Request received:', {
      body: req.body,
      headers: req.headers['content-type'],
      method: req.method
    });
    
    res.json({
      success: true,
      message: 'Debug verification endpoint working',
      received: req.body,
      timestamp: new Date().toISOString()
    });
  });

  // Admin logging endpoints (secure backend-only access)
  app.post('/api/admin/log-navigation', authMiddleware, asyncHandler(async (req: any, res: any) => {
    // Silently handle navigation logging without crashing on errors
    try {
      console.log('[Admin Navigation Log]', req.body);
      res.json({ success: true });
    } catch (error) {
      console.warn('[Admin Navigation Log] Error:', error);
      res.json({ success: false }); // Don't throw to avoid UI crashes
    }
  }));

  app.post('/api/admin/log-action', authMiddleware, asyncHandler(async (req: any, res: any) => {
    // Silently handle action logging without crashing on errors
    try {
      console.log('[Admin Action Log]', req.body);
      res.json({ success: true });
    } catch (error) {
      console.warn('[Admin Action Log] Error:', error);
      res.json({ success: false }); // Don't throw to avoid UI crashes
    }
  }));

  app.get('/api/admin/logs', authMiddleware, asyncHandler(async (req: any, res: any) => {
    // Return empty logs for now - implement full logging if needed
    res.json([]);
  }));

  app.post('/api/user/track-login', authMiddleware, asyncHandler(async (req: any, res: any) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Not authenticated' });

      await db.execute(
        sql`UPDATE profiles SET last_login_at = NOW() WHERE id = ${userId}`
      );
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to track login' });
    }
  }));

  // User preferences endpoints to prevent 406 errors
  app.get('/api/user/preferences', authMiddleware, asyncHandler(async (req: any, res: any) => {
    try {
      const userId = req.query.user_id || req.user?.id;
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      // For now, return empty preferences - can be extended to use database
      res.json({ user_id: userId, matching_criteria: null });
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      res.status(500).json({ error: 'Failed to fetch preferences' });
    }
  }));

  app.post('/api/user/preferences', authMiddleware, asyncHandler(async (req: any, res: any) => {
    try {
      const { user_id, matching_criteria } = req.body;
      if (!user_id) {
        return res.status(400).json({ error: 'User ID required' });
      }

      // For now, just acknowledge the save - can be extended to use database
      console.log('Saving user preferences:', { user_id, matching_criteria });
      res.json({ success: true, message: 'Preferences saved' });
    } catch (error) {
      console.error('Error saving user preferences:', error);
      res.status(500).json({ error: 'Failed to save preferences' });
    }
  }));

  
  // Add reporting routes
  app.use('/api/reports', reportsRouter);

  // Register saved posts routes
  app.use('/api/saved-posts', savedPostsRouter);

  // Register bookmarks routes
  app.use('/api/bookmarks', bookmarksRouter);

  // Register reports routes (separate from existing reports)
  app.use('/api/content-reports', reportsRouter);
  app.use('/api/community', communityRouter);
  app.use('/api/groups', groupPostsRouter);
  app.use('/api/support', supportRouter);
  app.use('/api/bugs', bugsRouter);

  // Register follows routes
  app.use('/api/follows', followsRouter);

  // Register payments routes for Stripe Connect PaymentIntents
  app.use('/api/payments', paymentsRouter);

  // Register bookings routes
  app.use('/api/bookings', bookingsRouter);

  // Register payouts routes
  app.use('/api/payouts', payoutsRouter);

  // Payout routes are registered above with the verification routes



  app.post("/api/auth/refresh", (req, res) => {
    const userId = req.user?.id || null;
    console.log('[PROOF:AUTH:REFRESH]', JSON.stringify({ ran: true, ok: true, reason: 'supabase_handles_refresh', userId }));
    res.json({ ok: true, message: 'Supabase handles token refresh automatically' });
  });

  app.get("/api/auth/status", async (req, res) => {
    try {
      const userId = req.query?.user_id as string || req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          authenticated: false,
          message: 'No user session found' 
        });
      }

      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ 
          authenticated: false,
          message: 'User profile not found' 
        });
      }

      // Check session validity (15 minutes)
      const now = Date.now();
      const lastActive = new Date(profile.updated_at!).getTime();
      const fifteenMinutes = 15 * 60 * 1000;
      const isExpired = now - lastActive > fifteenMinutes;

      res.json({
        authenticated: !isExpired,
        user_id: userId,
        last_active: profile.updated_at,
        session_expired: isExpired,
        time_remaining: isExpired ? 0 : fifteenMinutes - (now - lastActive)
      });
    } catch (error) {
      console.error('Session status check error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to check session status' 
      });
    }
  });

  // Register new Stripe verification system routes
  app.use('/api/verification/start', startVerificationRouter);
  
  // New Stripe Connect endpoints (Step 1 + Step 3 polling)
  app.post('/create-connect-account', async (req, res) => {
    const { createConnectAccount } = await import('./routes/stripe/create-connect-account');
    return createConnectAccount(req, res);
  });
  
  app.get('/stripe/account-status/:acctId/:userId', async (req, res) => {
    const { getAccountStatus } = await import('./routes/stripe/account-status');
    return getAccountStatus(req, res);
  });
  
  // Payout routes - Health check
  app.get('/api/payout/start', async (req, res) => {
    const { getPayoutStart } = await import('./routes/payout/start');
    return getPayoutStart(req, res);
  });

  app.post('/api/payout/start', async (req, res) => {
    const { startPayout } = await import('./routes/payout/start');
    return startPayout(req, res);
  });
  
  app.post('/api/payout/status', async (req, res) => {
    const { checkPayoutStatus } = await import('./routes/payout/status');
    return checkPayoutStatus(req, res);
  });
  
  app.post('/api/payout/verify', verifyPayout);
  
  // New authenticated payout endpoints
  app.post('/api/payout/link', async (req, res) => {
    const { getPayoutLink } = await import('./routes/payout/link');
    return getPayoutLink(req, res);
  });
  
  app.get('/api/payout/status', async (req, res) => {
    const { getPayoutStatus } = await import('./routes/payout/status');
    return getPayoutStatus(req, res);
  });
  
  app.post('/api/payout/dashboard-link', async (req, res) => {
    const { getDashboardLink } = await import('./routes/payout/dashboard-link');
    return getDashboardLink(req, res);
  });
  
  app.use('/api/applications/progress', progressRouter);
  app.use('/api/applications/submit', submitRouter);
  
  // User consent recording for legal agreements
  app.post('/api/consent/record', async (req, res) => {
    const { recordConsent } = await import('./routes/consent/record');
    return recordConsent(req, res);
  });
  
  // Ensure application exists
  app.post('/api/applications/ensure', async (req, res) => {
    const { ensureApplication } = await import('./routes/applications/ensure');
    return ensureApplication(req, res);
  });
  
  // Ensure all onboarding IDs exist (bullet-proof) - no auth middleware, use Bearer token
  app.post('/api/onboarding/ensure-ids', async (req, res) => {
    const { ensureOnboardingIds } = await import('./routes/onboarding/ensure-ids');
    return ensureOnboardingIds(req, res);
  });

  // Ensure open application exists (bullet-proof with clear errors) - NO AUTH REQUIRED
  app.post('/api/applications/ensure-open', 
    // Skip auth middleware - this is used during onboarding before full auth
    (req, res, next) => {
      req.skipAuth = true;
      next();
    },
    async (req, res) => {
      const { ensureOpenApplication } = await import('./routes/applications/ensure-open');
      return ensureOpenApplication(req, res);
    }
  );
  // Stripe account status endpoint
  app.get('/api/stripe/status', async (req, res) => {
    try {
      const { accountId } = req.query;
      
      if (!accountId || typeof accountId !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: 'accountId parameter is required' 
        });
      }

      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const account = await stripe.accounts.retrieve(accountId);
      
      res.json({
        success: true,
        id: account.id,
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        requirements_pending: account.requirements?.currently_due?.length || 0
      });
    } catch (error: any) {
      console.error('[STRIPE STATUS] Error:', error);
      res.status(500).json({ 
        success: false, 
        message: error?.message || 'Internal server error' 
      });
    }
  });

  // Stripe account status by authenticated user
  app.get('/api/stripe/account/status', async (req, res) => {
    const { getStripeAccountStatus } = await import('./routes/stripe/account/status');
    return getStripeAccountStatus(req, res);
  });

  app.use('/api/stripe/webhook', stripeWebhookRouter);

  // Register health check routes
  registerHealthRoutes(app);

  app.get('/api/dev/whoami', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ error: 'Not available in production' });
    }
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        console.log('[PROOF:WHOAMI]', JSON.stringify({ supabaseUserId: null, neonProfileExists: false, neonProfileId: null, username: null }));
        return res.json({ supabaseUserId: null, neonProfileExists: false, neonProfileId: null, username: null });
      }
      const token = authHeader.substring(7);
      const { createClient } = await import('@supabase/supabase-js');
      const sb = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
      const { data: { user }, error: authError } = await sb.auth.getUser(token);
      if (authError || !user) {
        console.log('[PROOF:WHOAMI]', JSON.stringify({ supabaseUserId: null, neonProfileExists: false, neonProfileId: null, username: null, authError: authError?.message }));
        return res.json({ supabaseUserId: null, neonProfileExists: false, neonProfileId: null, username: null, authError: authError?.message });
      }
      const neonProfile = await storage.getProfile(user.id);
      const result = {
        supabaseUserId: user.id,
        neonProfileExists: !!neonProfile,
        neonProfileId: neonProfile?.id || null,
        username: neonProfile?.username || null,
      };
      console.log('[PROOF:WHOAMI]', JSON.stringify(result));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Dev-only: backfill Neon profiles from Supabase Auth users
  app.post('/api/dev/backfill-profiles', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ error: 'Not available in production' });
    }
    try {
      const { supabaseAdmin } = await import('./lib/supabaseAdmin');
      const { ensureProfile } = await import('./lib/ensureProfile');

      let page = 1;
      let totalInserted = 0;
      let totalExisting = 0;
      const perPage = 100;
      let keepGoing = true;

      while (keepGoing) {
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
        if (error) {
          console.error('[backfill] Supabase admin.listUsers error:', error);
          return res.status(500).json({ error: 'Failed to list Supabase Auth users', details: error.message });
        }
        if (!users || users.length === 0) {
          keepGoing = false;
          break;
        }

        for (const u of users) {
          const existing = await storage.getProfile(u.id);
          if (existing) {
            totalExisting++;
            continue;
          }
          await ensureProfile({
            id: u.id,
            email: u.email || null,
            full_name: u.user_metadata?.full_name || u.user_metadata?.name || null,
            username: u.user_metadata?.username || (u.email ? u.email.split('@')[0] : null),
            avatar_url: u.user_metadata?.avatar_url || null,
          });
          totalInserted++;
        }

        if (users.length < perPage) {
          keepGoing = false;
        }
        page++;
      }

      const totalProfiles = await db.select({ count: sql<number>`count(*)` }).from(profiles);
      const profileCount = Number(totalProfiles[0]?.count || 0);

      console.log(`[backfill] Done. Inserted: ${totalInserted}, Already existed: ${totalExisting}, Total profiles now: ${profileCount}`);
      res.json({ inserted: totalInserted, alreadyExisted: totalExisting, totalProfiles: profileCount });
    } catch (error: any) {
      console.error('[backfill] Error:', error);
      res.status(500).json({ error: 'Backfill failed', details: error.message });
    }
  });

  app.post("/api/dev/test-messaging", async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Dev endpoint disabled in production' });
    }
    try {
      const allProfiles = await db.select({ id: profiles.id, username: profiles.username }).from(profiles).limit(3);
      if (allProfiles.length < 2) {
        return res.status(400).json({ error: 'Need at least 2 profiles to test messaging' });
      }
      const actorId = allProfiles[0].id;
      const targetId = allProfiles[1].id;
      const conversation = await storage.findOrCreateConversation(actorId, targetId, null);
      console.log('[PROOF:MSG:OK]', JSON.stringify({ conversationId: conversation.id, created: conversation.created }));
      res.json({ ok: true, conversationId: conversation.id, created: conversation.created, actorId, targetId });
    } catch (error: any) {
      console.error('[PROOF:MSG:ERR] test-messaging', error?.message);
      res.status(500).json({ error: error?.message });
    }
  });

  app.post("/api/dev/seed-listings", async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      console.log('[PROOF:SEED:LISTINGS]', JSON.stringify({ ran: false, env: 'production' }));
      return res.status(403).json({ error: 'Seeding disabled in production' });
    }
    try {
      const existingProfiles = await db.select({ id: profiles.id }).from(profiles).limit(3);
      if (existingProfiles.length === 0) {
        return res.status(400).json({ error: 'No profiles exist to attach listings to' });
      }
      const sellerId = existingProfiles[0].id;

      const seedListings = [
        { user_id: sellerId, dog_name: 'Bella', breed: 'French Bulldog', age: 4, price: '2500', gender: 'female', description: 'Playful French Bulldog puppy', location: 'Houston, TX', image_url: 'https://images.unsplash.com/photo-1583337130417-13104dec14a3?w=400', status: 'active', vaccinated: true, good_with_kids: true },
        { user_id: sellerId, dog_name: 'Max', breed: 'Golden Retriever', age: 6, price: '1800', gender: 'male', description: 'Friendly Golden Retriever', location: 'Los Angeles, CA', image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', status: 'active', vaccinated: true, good_with_kids: true },
        { user_id: sellerId, dog_name: 'Luna', breed: 'Labrador Retriever', age: 3, price: '1200', gender: 'female', description: 'Sweet Lab puppy', location: 'San Diego, CA', image_url: 'https://images.unsplash.com/photo-1591160690555-5debfba0c36a?w=400', status: 'active', vaccinated: true },
        { user_id: sellerId, dog_name: 'Charlie', breed: 'German Shepherd', age: 8, price: '2000', gender: 'male', description: 'Loyal German Shepherd', location: 'Denver, CO', image_url: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400', status: 'active', good_with_dogs: true },
        { user_id: sellerId, dog_name: 'Daisy', breed: 'Poodle', age: 5, price: '900', gender: 'female', description: 'Hypoallergenic Poodle', location: 'Seattle, WA', image_url: 'https://images.unsplash.com/photo-1616149482875-ebce31de76a4?w=400', status: 'active', vaccinated: true },
        { user_id: existingProfiles[Math.min(1, existingProfiles.length - 1)].id, dog_name: 'Rocky', breed: 'Bulldog', age: 7, price: '1500', gender: 'male', description: 'Calm and gentle Bulldog', location: 'Miami, FL', image_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400', status: 'active' },
        { user_id: existingProfiles[Math.min(1, existingProfiles.length - 1)].id, dog_name: 'Sophie', breed: 'Beagle', age: 4, price: '700', gender: 'female', description: 'Adorable Beagle puppy', location: 'Austin, TX', image_url: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400', status: 'active', good_with_kids: true },
        { user_id: existingProfiles[Math.min(2, existingProfiles.length - 1)].id, dog_name: 'Cooper', breed: 'Husky', age: 10, price: '2200', gender: 'male', description: 'Energetic Siberian Husky', location: 'Portland, OR', image_url: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400', status: 'active', good_with_dogs: true },
      ];

      const inserted = await db.insert(dogListings).values(seedListings as any).returning();
      console.log('[PROOF:SEED:LISTINGS]', JSON.stringify({ ran: true, count: inserted.length, env: process.env.NODE_ENV || 'development' }));
      res.json({ ok: true, count: inserted.length });
    } catch (error: any) {
      console.error('[PROOF:SEED:LISTINGS] error', error?.message);
      res.status(500).json({ error: 'Seeding failed' });
    }
  });

  // 404 handler for API routes only (not for static files)
  app.use('/api/*', notFoundHandler);

  // Global error handler (must be last)
  app.use(globalErrorHandler);

  const httpServer = createServer(app);
  setupSocketIO(httpServer);
  return httpServer;
}
