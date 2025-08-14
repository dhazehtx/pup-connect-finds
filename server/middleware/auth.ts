import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with hardcoded values for now
const supabase = createClient(
  'https://wneticxjhxpjpfghnclr.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZXRpY3hqaHhwanBmZ2huY2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzOTQ5MDksImV4cCI6MjA2Mzk3MDkwOX0.7bFOxaZyK97nruVmJFbyNpd6VnmgJpGVTzYtcZ74lUo'
);

// Extend Express Request interface to include user and authentication methods
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        [key: string]: any;
      };
      isAuthenticated(): boolean;
    }
  }
}

/**
 * Authentication middleware for API routes
 * Verifies Supabase JWT token and adds user info to request
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      // Add isAuthenticated method that returns false
      req.isAuthenticated = () => false;
      return next();
    }

    // Handle token encoding issues that cause ByteString errors
    try {
      // First, handle any encoding issues by properly parsing the header value
      let cleanedToken = token.trim();
      
      // For UTF-8 encoded tokens, convert to proper string
      if (token.includes('\u2026') || token.includes('…')) {
        console.log('Detected truncated or malformed token with ellipsis');
        req.isAuthenticated = () => false;
        return next();
      }
      
      // Remove any non-printable ASCII characters
      cleanedToken = cleanedToken.replace(/[^\x21-\x7E]/g, '');
      
      // Validate JWT structure
      const parts = cleanedToken.split('.');
      if (parts.length !== 3) {
        console.log('Token validation failed: JWT must have 3 parts, got', parts.length);
        req.isAuthenticated = () => false;
        return next();
      }
      
      // Ensure each part contains only valid base64url characters
      const base64UrlRegex = /^[A-Za-z0-9_-]+$/;
      if (!parts.every(part => base64UrlRegex.test(part))) {
        console.log('Token validation failed: Invalid base64url characters');
        req.isAuthenticated = () => false;
        return next();
      }
      
      token = cleanedToken;
    } catch (tokenError) {
      console.error('Token validation error:', tokenError);
      req.isAuthenticated = () => false;
      return next();
    }
    
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      // Add isAuthenticated method that returns false
      req.isAuthenticated = () => false;
      return next();
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email,
      ...user.user_metadata
    };

    // Add isAuthenticated method that returns true
    req.isAuthenticated = () => true;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    // Add isAuthenticated method that returns false
    req.isAuthenticated = () => false;
    next();
  }
};

/**
 * Middleware that requires authentication
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }
  next();
};

/**
 * Middleware that requires admin privileges
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }

  // Check if user has admin role (you might need to adjust this based on your user schema)
  if (!req.user?.is_admin) {
    return res.status(403).json({ 
      error: 'Admin access required',
      message: 'You need admin privileges to access this resource'
    });
  }

  next();
};