import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[AUTH] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

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

    const { storage } = await import('../storage');
    let profile = await storage.getProfile(user.id);

    if (!profile) {
      console.log('[AUTH MIDDLEWARE] No Neon profile for user, auto-creating:', user.id, user.email);
      try {
        const meta = user.user_metadata || {};
        profile = await storage.createProfile({
          id: user.id,
          email: user.email || null,
          username: meta.username || meta.user_name || (user.email ? user.email.split('@')[0] : null),
          full_name: meta.full_name || meta.name || null,
          avatar_url: meta.avatar_url || null,
          user_type: 'buyer',
        } as any);
        console.log('[AUTH MIDDLEWARE] Auto-created profile:', profile.id);
      } catch (createErr: any) {
        if (createErr?.code === '23505') {
          profile = await storage.getProfile(user.id);
          console.log('[AUTH MIDDLEWARE] Profile already existed (race condition), fetched:', profile?.id);
        } else {
          console.error('[AUTH MIDDLEWARE] Failed to auto-create profile:', createErr);
        }
      }
    }

    req.user = {
      id: user.id,
      email: user.email,
      is_admin: profile?.is_admin || false,
      username: profile?.username,
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