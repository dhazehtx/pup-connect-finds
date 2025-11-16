import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';

// Initialize Supabase client for JWT verification
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
      skipAuth?: boolean;
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

    // Early validation to prevent ByteString errors before reaching Supabase
    try {
      // Handle truncated tokens that end with ellipsis (common browser issue)
      if (token.endsWith('…') || token.includes('…') || token.includes('\u2026')) {
        req.isAuthenticated = () => false;
        return next();
      }
      
      // Check for problematic Unicode characters at any position
      for (let i = 0; i < token.length; i++) {
        const charCode = token.charCodeAt(i);
        if (charCode > 255) {
          req.isAuthenticated = () => false;
          return next();
        }
      }
      
      // Validate basic JWT structure before processing
      const parts = token.trim().split('.');
      if (parts.length !== 3 || parts.some(part => !part)) {
        req.isAuthenticated = () => false;
        return next();
      }
      
      // Ensure token contains only valid characters
      if (!/^[A-Za-z0-9._-]+$/.test(token)) {
        req.isAuthenticated = () => false;
        return next();
      }
      
    } catch (tokenError) {
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

    // Fetch user profile to get is_admin status using admin client to bypass RLS
    console.log('[AUTH MIDDLEWARE] Looking up profile for user:', user.id, user.email);
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin, role, username')
      .eq('id', user.id)
      .single();

    console.log('[AUTH MIDDLEWARE] Profile lookup result:', {
      userId: user.id,
      email: user.email,
      hasProfile: !!profile,
      isAdmin: profile?.is_admin,
      error: profileError?.message
    });

    // Add user info to request with admin status
    req.user = {
      id: user.id,
      email: user.email,
      is_admin: profile?.is_admin || false,
      role: profile?.role,
      ...user.user_metadata
    };

    console.log('[AUTH MIDDLEWARE] Set req.user with is_admin:', req.user.is_admin);

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