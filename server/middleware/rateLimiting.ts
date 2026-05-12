import { Request, Response, NextFunction } from 'express';
import { debugApiLog } from '../lib/debugApi';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import slowDown from 'express-slow-down';

// Store for tracking abuse attempts
interface AbuseAttempt {
  ip: string;
  userId?: string;
  endpoint: string;
  timestamp: Date;
  userAgent: string;
  attempts: number;
}

class RateLimitStore {
  private attempts: Map<string, AbuseAttempt> = new Map();
  private lockouts: Map<string, Date> = new Map();

  // Log abuse attempt
  logAbuseAttempt(req: Request, endpoint: string): void {
    const key = this.getKey(req);
    const existing = this.attempts.get(key);
    
    const attempt: AbuseAttempt = {
      ip: req.ip || 'unknown',
      userId: req.user?.id,
      endpoint,
      timestamp: new Date(),
      userAgent: req.get('User-Agent') || 'unknown',
      attempts: existing ? existing.attempts + 1 : 1
    };

    this.attempts.set(key, attempt);
    
    debugApiLog(`[RATE_LIMIT_ABUSE] ${JSON.stringify({
      ip: attempt.ip,
      userId: attempt.userId,
      endpoint: attempt.endpoint,
      attempts: attempt.attempts,
      timestamp: attempt.timestamp.toISOString(),
      userAgent: attempt.userAgent
    })}`);
  }

  // Check if IP/user is locked out
  isLockedOut(req: Request): boolean {
    const key = this.getKey(req);
    const lockoutTime = this.lockouts.get(key);
    
    if (lockoutTime && new Date() < lockoutTime) {
      return true;
    }
    
    if (lockoutTime && new Date() >= lockoutTime) {
      this.lockouts.delete(key);
    }
    
    return false;
  }

  // Apply lockout with exponential backoff
  applyLockout(req: Request, attempts: number): void {
    const key = this.getKey(req);
    // Exponential backoff: 1min, 5min, 15min, 1hr, 24hr
    const backoffMinutes = Math.min(Math.pow(2, attempts - 5) * 1, 1440); // Max 24 hours
    const lockoutUntil = new Date(Date.now() + backoffMinutes * 60 * 1000);
    
    this.lockouts.set(key, lockoutUntil);
    
    debugApiLog(`[LOCKOUT_APPLIED] ${JSON.stringify({
      key,
      attempts,
      lockoutMinutes: backoffMinutes,
      lockoutUntil: lockoutUntil.toISOString()
    })}`);
  }

  private getKey(req: Request): string {
    // Prefer user ID if authenticated, otherwise use IP
    return req.user?.id ? `user:${req.user.id}` : `ip:${req.ip}`;
  }

  // Get abuse statistics for admin panel
  getAbuseStats(): { attempts: AbuseAttempt[], lockouts: Array<{key: string, until: Date}> } {
    const attempts: AbuseAttempt[] = [];
    const lockouts: Array<{key: string, until: Date}> = [];
    
    this.attempts.forEach((attempt) => attempts.push(attempt));
    this.lockouts.forEach((until, key) => lockouts.push({ key, until }));
    
    return { attempts, lockouts };
  }

  // Make attempts accessible for admin checks
  getAttempts() {
    return this.attempts;
  }

  // Clean up old entries (call periodically)
  cleanup(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Clean up old attempts
    this.attempts.forEach((attempt, key) => {
      if (attempt.timestamp < oneDayAgo) {
        this.attempts.delete(key);
      }
    });
    
    // Clean up expired lockouts
    const now = new Date();
    this.lockouts.forEach((until, key) => {
      if (now >= until) {
        this.lockouts.delete(key);
      }
    });
  }
}

const rateLimitStore = new RateLimitStore();

// Clean up old entries every hour
setInterval(() => rateLimitStore.cleanup(), 60 * 60 * 1000);

// Helper function to check if request should be rate limited
const shouldRateLimit = (req: Request): boolean => {
  const path = req.path;

  // PaaS liveness (Railway/Render) — must not share slow-down / 429 with app traffic.
  if (path === "/api/health/live") {
    return false;
  }

  // Skip rate limiting for static assets, Vite HMR, and dev server resources
  if (
    path.startsWith('/@vite') ||
    path.startsWith('/@fs') ||
    path.startsWith('/src/') ||
    path.startsWith('/node_modules/') ||
    path.includes('.js') ||
    path.includes('.css') ||
    path.includes('.png') ||
    path.includes('.jpg') ||
    path.includes('.svg') ||
    path.includes('.ico') ||
    path.includes('.woff') ||
    path.includes('.ttf') ||
    path.includes('__vite_ping') ||
    req.headers['accept']?.includes('text/css') ||
    req.headers['accept']?.includes('application/javascript') ||
    req.headers['sec-fetch-dest'] === 'script' ||
    req.headers['sec-fetch-dest'] === 'style'
  ) {
    return false;
  }
  
  return true;
};

// Lockout check middleware
export const checkLockout = (req: Request, res: Response, next: NextFunction) => {
  // Skip rate limiting for development assets
  if (!shouldRateLimit(req)) {
    next();
    return;
  }
  
  if (rateLimitStore.isLockedOut(req)) {
    return res.status(429).json({
      error: 'Account temporarily locked due to suspicious activity',
      message: 'Your account has been temporarily locked due to repeated violations. Please try again later.',
      retryAfter: 3600 // 1 hour default
    });
  }
  next();
};

// General rate limiter - 200 requests per minute (increased for dev)
export const generalRateLimit: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // Increased to accommodate dev server requests
  skip: (req: Request) => !shouldRateLimit(req), // Skip static assets
  message: {
    error: 'Too many requests',
    message: "You're doing that too much. Please wait a moment.",
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.user?.id ? `user:${req.user.id}` : req.ip || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    rateLimitStore.logAbuseAttempt(req, req.path);
    res.status(429).json({
      error: 'Too many requests',
      message: "You're doing that too much. Please wait a moment.",
      retryAfter: 60
    });
  },
  validate: {
    keyGeneratorIpFallback: false
  }
});

// Strict rate limiter for sensitive endpoints - 10 requests per minute
export const strictRateLimit: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  skip: (req: Request) => !shouldRateLimit(req), // Skip static assets
  message: {
    error: 'Too many requests to sensitive endpoint',
    message: "You're making too many requests to this endpoint. Please wait before trying again.",
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.user?.id ? `user:${req.user.id}` : req.ip || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    rateLimitStore.logAbuseAttempt(req, req.path);
    
    // Apply lockout after 5 violations
    const key = req.user?.id ? `user:${req.user.id}` : req.ip || 'unknown';
    const attempts = rateLimitStore.getAttempts().get(key)?.attempts || 0;
    
    if (attempts >= 5) {
      rateLimitStore.applyLockout(req, attempts);
    }
    
    res.status(429).json({
      error: 'Too many requests to sensitive endpoint',
      message: "You're making too many requests to this endpoint. Please wait before trying again.",
      retryAfter: 60
    });
  },
  validate: {
    keyGeneratorIpFallback: false
  }
});

// Auth rate limiter - 5 attempts per 15 minutes
export const authRateLimit: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  skip: (req: Request) => !shouldRateLimit(req), // Skip static assets
  message: {
    error: 'Too many authentication attempts',
    message: "Too many login attempts. Please wait 15 minutes before trying again.",
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => `auth:${req.ip || 'unknown'}`,
  handler: (req: Request, res: Response) => {
    rateLimitStore.logAbuseAttempt(req, 'auth');
    
    // Immediate lockout for auth abuse
    rateLimitStore.applyLockout(req, 10);
    
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: "Too many login attempts. Please wait 15 minutes before trying again.",
      retryAfter: 900
    });
  },
  validate: {
    keyGeneratorIpFallback: false
  }
});

// Messaging rate limiter - 30 messages per minute
export const messagingRateLimit: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  skip: (req: Request) => !shouldRateLimit(req), // Skip static assets
  message: {
    error: 'Too many messages sent',
    message: "You're sending messages too quickly. Please slow down.",
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.user?.id ? `msg:${req.user.id}` : `msg:${req.ip || 'unknown'}`;
  },
  handler: (req: Request, res: Response) => {
    rateLimitStore.logAbuseAttempt(req, 'messaging');
    res.status(429).json({
      error: 'Too many messages sent',
      message: "You're sending messages too quickly. Please slow down.",
      retryAfter: 60
    });
  },
  validate: {
    keyGeneratorIpFallback: false
  }
});

// Listing creation rate limiter - 10 listings per hour
export const listingRateLimit: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  skip: (req: Request) => !shouldRateLimit(req), // Skip static assets
  message: {
    error: 'Too many listings created',
    message: "You're creating listings too quickly. Please wait before creating another.",
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.user?.id ? `listing:${req.user.id}` : `listing:${req.ip || 'unknown'}`;
  },
  handler: (req: Request, res: Response) => {
    rateLimitStore.logAbuseAttempt(req, 'listing-creation');
    res.status(429).json({
      error: 'Too many listings created',
      message: "You're creating listings too quickly. Please wait before creating another.",
      retryAfter: 3600
    });
  },
  validate: {
    keyGeneratorIpFallback: false
  }
});

// Lost-pet specific aliases; kept separate to allow future tuning.
export const lostPetAiMatchRateLimit = strictRateLimit;
export const lostPetPatchRateLimit = generalRateLimit;

// Speed limiter with progressive delays
export const speedLimiter = slowDown({
  windowMs: 60 * 1000, // 1 minute
  delayAfter: 100, // Allow 100 requests per minute at full speed (increased for dev)
  delayMs: () => 200, // Reduced delay for better dev experience
  maxDelayMs: 5000, // Reduced maximum delay
  skip: (req: Request) => !shouldRateLimit(req), // Skip static assets
  keyGenerator: (req: Request) => {
    return req.user?.id ? `speed:${req.user.id}` : `speed:${req.ip || 'unknown'}`;
  }
});

// Admin endpoint to get abuse statistics
export const getAbuseStats = (req: Request, res: Response) => {
  // Check if user is admin (implement your admin check logic)
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const stats = rateLimitStore.getAbuseStats();
  res.json(stats);
};

export default rateLimitStore;