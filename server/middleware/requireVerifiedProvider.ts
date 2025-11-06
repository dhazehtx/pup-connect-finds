import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

/**
 * Middleware to ensure the authenticated user has a verified provider account
 * Use this on routes that only verified providers should access
 */
export async function requireVerifiedProvider(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Ensure user is authenticated (should be handled by authMiddleware before this)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be signed in to access this resource'
      });
    }

    const userId = req.user.id;

    // Check if user has a verified provider account
    const { data: provider, error } = await supabase
      .from('providers')
      .select('id, status')
      .eq('user_id', userId)
      .single();

    if (error || !provider) {
      return res.status(403).json({ 
        error: 'Provider account not found',
        message: 'You must have a provider account to access this resource'
      });
    }

    if (provider.status !== 'verified') {
      return res.status(403).json({ 
        error: 'Provider not verified',
        message: 'Your provider account is pending verification. Please wait for admin approval.',
        status: provider.status
      });
    }

    // Provider is verified, attach provider info to request for downstream use
    req.provider = { id: provider.id, status: provider.status };
    next();

  } catch (error) {
    console.error('[requireVerifiedProvider] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to verify provider status'
    });
  }
}
