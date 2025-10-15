import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

// Security middleware with optimized settings
// NOTE: CSP is now handled via direct Express header in server/index.ts
export const securityMiddleware = helmet({
  // Disable Helmet's CSP since we're using direct header approach
  contentSecurityPolicy: false,
  
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