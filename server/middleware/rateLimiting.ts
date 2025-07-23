import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { Request, Response } from 'express';

// Extend Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

// Rate limiting configuration
export const rateLimitConfig = {
  // Authentication routes (login, register, password reset)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
      error: 'Too many authentication attempts',
      message: 'Please wait 15 minutes before trying again',
      retryAfter: 15 * 60 // seconds
    }
  },
  
  // General API requests
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: 15 * 60 // seconds
    }
  },
  
  // Message posting
  messaging: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 messages per window
    message: {
      error: 'Too many messages sent',
      message: 'Please wait before sending more messages',
      retryAfter: 15 * 60 // seconds
    }
  },
  
  // Search and data-intensive operations
  search: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // 20 searches per window
    message: {
      error: 'Too many search requests',
      message: 'Please wait before performing more searches',
      retryAfter: 5 * 60 // seconds
    }
  },
  
  // File uploads
  uploads: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // 10 uploads per window
    message: {
      error: 'Too many upload attempts',
      message: 'Please wait before uploading more files',
      retryAfter: 10 * 60 // seconds
    }
  }
};

// Custom key generator that uses user ID when available, falls back to IP
const createKeyGenerator = (useUserId = false) => {
  return (req: Request): string => {
    if (useUserId && req.user?.id) {
      return `user:${req.user.id}`;
    }
    
    // Get real IP address, handling proxies
    const forwarded = req.headers['x-forwarded-for'] as string;
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.connection.remoteAddress;
    return `ip:${ip}`;
  };
};

// Custom handler for rate limit exceeded
const createRateLimitHandler = (limitType: string) => {
  return (req: Request, res: Response) => {
    const config = rateLimitConfig[limitType as keyof typeof rateLimitConfig];
    const identifier = createKeyGenerator(limitType === 'messaging')(req);
    
    // Log abuse attempt
    console.warn(`Rate limit exceeded [${limitType}]:`, {
      identifier,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      endpoint: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
    
    // Set appropriate headers
    res.set({
      'Retry-After': config.message.retryAfter.toString(),
      'X-RateLimit-Limit': config.max.toString(),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': new Date(Date.now() + config.windowMs).toISOString()
    });
    
    return res.status(429).json(config.message);
  };
};

// Authentication rate limiter (stricter for login attempts)
export const authRateLimit = rateLimit({
  windowMs: rateLimitConfig.auth.windowMs,
  max: rateLimitConfig.auth.max,
  keyGenerator: createKeyGenerator(false), // Use IP for auth attempts
  handler: createRateLimitHandler('auth'),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for successful authentication
    return req.method === 'GET' || req.path.includes('/verify');
  }
});

// General API rate limiter
export const generalRateLimit = rateLimit({
  windowMs: rateLimitConfig.general.windowMs,
  max: rateLimitConfig.general.max,
  keyGenerator: createKeyGenerator(false), // Use IP for general requests
  handler: createRateLimitHandler('general'),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip for static assets, Vite dev assets, and health checks
    return req.path.startsWith('/assets') || 
           req.path.startsWith('/@') || // Vite dev assets
           req.path.startsWith('/src') || // Vite source files
           req.path.startsWith('/node_modules') ||
           req.path === '/health' || 
           req.path === '/favicon.ico';
  }
});

// Messaging rate limiter (per user)
export const messagingRateLimit = rateLimit({
  windowMs: rateLimitConfig.messaging.windowMs,
  max: rateLimitConfig.messaging.max,
  keyGenerator: createKeyGenerator(true), // Use user ID for messaging
  handler: createRateLimitHandler('messaging'),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Only apply to POST requests (sending messages)
    return req.method !== 'POST';
  }
});

// Search rate limiter
export const searchRateLimit = rateLimit({
  windowMs: rateLimitConfig.search.windowMs,
  max: rateLimitConfig.search.max,
  keyGenerator: createKeyGenerator(false), // Use IP for search requests
  handler: createRateLimitHandler('search'),
  standardHeaders: true,
  legacyHeaders: false
});

// Upload rate limiter
export const uploadRateLimit = rateLimit({
  windowMs: rateLimitConfig.uploads.windowMs,
  max: rateLimitConfig.uploads.max,
  keyGenerator: createKeyGenerator(true), // Use user ID for uploads
  handler: createRateLimitHandler('uploads'),
  standardHeaders: true,
  legacyHeaders: false
});

// Slow down middleware for gradual response delays
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests at full speed
  delayMs: () => 500, // Add 500ms delay per request after threshold
  maxDelayMs: 20000, // Maximum delay of 20 seconds
  keyGenerator: createKeyGenerator(false),
  skip: (req) => {
    return req.path.startsWith('/assets') || 
           req.path.startsWith('/@') || // Vite dev assets
           req.path.startsWith('/src') || // Vite source files
           req.path.startsWith('/node_modules') ||
           req.path === '/health';
  },
  validate: { delayMs: false } // Disable warning message
});

// Middleware to extract user info for rate limiting
export const userContextMiddleware = (req: Request, res: Response, next: () => void) => {
  // Extract user from JWT token if present
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      // This is a simplified extraction - in production you'd verify the JWT
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      req.user = { id: payload.sub };
    } catch (error) {
      // Invalid token, continue without user context
    }
  }
  next();
};

// Abuse detection middleware
export const abuseDetectionMiddleware = (req: Request, res: Response, next: () => void) => {
  const suspiciousPatterns = [
    /admin/i,
    /\.\.\//, // Directory traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /eval\(/i, // Code injection
  ];
  
  const requestData = JSON.stringify({
    url: req.url,
    body: req.body,
    query: req.query,
    headers: req.headers
  });
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestData));
  
  if (isSuspicious) {
    console.warn('Suspicious request detected:', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });
    
    // Don't block, just log for now - you could implement blocking here
  }
  
  next();
};

// Export configuration for easy updates
export const updateRateLimitConfig = (type: string, newConfig: Partial<typeof rateLimitConfig.general>) => {
  if (rateLimitConfig[type as keyof typeof rateLimitConfig]) {
    rateLimitConfig[type as keyof typeof rateLimitConfig] = {
      ...rateLimitConfig[type as keyof typeof rateLimitConfig],
      ...newConfig
    };
  }
};