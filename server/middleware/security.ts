import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

// Security middleware with optimized settings
export const securityMiddleware = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://js.stripe.com"
      ],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: [
        "'self'", 
        "https://api.stripe.com",
        "https://www.google-analytics.com",
        "https://region1.google-analytics.com",
        process.env.SUPABASE_URL || "",
        "wss:"
      ],
      frameSrc: ["'self'", "https://js.stripe.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  
  // Cross-Origin settings
  crossOriginEmbedderPolicy: false, // Allow embedding for Stripe, etc.
  crossOriginResourcePolicy: { policy: "cross-origin" },
  
  // HSTS - Force HTTPS in production
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // Prevent MIME type sniffing
  noSniff: true,
  
  // Prevent clickjacking
  frameguard: { action: 'deny' },
  
  // Remove X-Powered-By header
  hidePoweredBy: true,
  
  // Referrer Policy
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
});

// Additional security headers
export const additionalSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent caching of sensitive content
  if (req.path.startsWith('/api/admin') || req.path.startsWith('/api/export-user-data')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  
  next();
};

export default securityMiddleware;