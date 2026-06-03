import { Request, Response, NextFunction } from 'express';
import type { AuthUser } from '../types/authUser';
import { runSupabaseWithRetry } from '../lib/supabaseResilience';
import { getRawServerSupabaseUrl } from '../lib/serverSupabaseEnv';
import { supabase } from '../lib/supabase';

const hasUrl = Boolean(getRawServerSupabaseUrl());
const hasKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
if (!hasUrl || !hasKey) {
  console.error('[AUTH] Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
}

/** Throttle noisy ensureProfile failures (e.g. DB down) so Railway logs are usable. */
let lastEnsureProfileFailureLogMs = 0;
const ENSURE_PROFILE_FAIL_LOG_COOLDOWN_MS = 60_000;

let lastAuthMiddlewareErrorLogMs = 0;
const AUTH_MIDDLEWARE_ERROR_LOG_COOLDOWN_MS = 60_000;

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
      if (parts.length !== 3 || parts.some((part) => !part)) {
        req.isAuthenticated = () => false;
        return next();
      }

      // Ensure token contains only valid characters
      if (!/^[A-Za-z0-9._-]+$/.test(token)) {
        req.isAuthenticated = () => false;
        return next();
      }
    } catch {
      req.isAuthenticated = () => false;
      return next();
    }

    if (!supabase) {
      req.isAuthenticated = () => false;
      return next();
    }

    // Verify the JWT token with Supabase
    const {
      data: { user },
      error,
    } = await runSupabaseWithRetry(() => supabase!.auth.getUser(token), { opName: 'auth.getUser' });

    if (error || !user) {
      // Add isAuthenticated method that returns false
      req.isAuthenticated = () => false;
      return next();
    }

    const { ensureProfile } = await import('../lib/ensureProfile');
    const meta = user.user_metadata || {};
    let profile;
    try {
      profile = await ensureProfile({
        id: user.id,
        email: user.email || null,
        username: meta.username || meta.user_name || null,
        full_name: meta.full_name || meta.name || null,
        avatar_url: meta.avatar_url || null,
      });
    } catch (err: unknown) {
      const now = Date.now();
      if (now - lastEnsureProfileFailureLogMs >= ENSURE_PROFILE_FAIL_LOG_COOLDOWN_MS) {
        lastEnsureProfileFailureLogMs = now;
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[AUTH MIDDLEWARE] ensureProfile failed for authUserId=', user.id, msg);
      }
      profile = null;
    }

    const authUser: AuthUser = {
      ...(user.user_metadata as Record<string, unknown>),
      id: user.id,
      email: user.email,
      is_admin: Boolean(profile?.is_admin),
      username: profile?.username ?? null,
      full_name: (profile?.full_name ?? meta.full_name ?? meta.name ?? null) as string | null,
      name: (meta.name ?? meta.full_name ?? null) as string | null,
      avatar_url: (profile?.avatar_url ?? meta.avatar_url ?? null) as string | null,
    };
    req.user = authUser;

    // Add isAuthenticated method that returns true
    req.isAuthenticated = () => true;

    next();
  } catch (error: any) {
    if (error?.code === 'SUPABASE_DEGRADED') {
      res.locals.authDegraded = true;
      req.isAuthenticated = () => false;
      return next();
    }
    const now = Date.now();
    if (now - lastAuthMiddlewareErrorLogMs >= AUTH_MIDDLEWARE_ERROR_LOG_COOLDOWN_MS) {
      lastAuthMiddlewareErrorLogMs = now;
      console.error('Auth middleware error:', error);
    }
    // Add isAuthenticated method that returns false
    req.isAuthenticated = () => false;
    next();
  }
};

/**
 * Middleware that requires authentication
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (res.locals.authDegraded) {
    return res.status(503).json({
      error: 'Authentication temporarily unavailable',
      code: 'SUPABASE_DEGRADED',
      message: 'Auth service is degraded. Please retry shortly.',
    });
  }
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to access this resource',
    });
  }
  next();
};

/**
 * Middleware that requires admin privileges
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (res.locals.authDegraded) {
    return res.status(503).json({
      error: 'Admin authentication temporarily unavailable',
      code: 'SUPABASE_DEGRADED',
      message: 'Auth service is degraded. Please retry shortly.',
    });
  }
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to access this resource',
    });
  }

  // Check if the user has admin role (should be handled by auth middleware before this)
  if (!req.user?.is_admin) {
    return res.status(403).json({
      error: 'Admin access required',
      message: 'You need admin privileges to access this resource',
    });
  }

  next();
};
