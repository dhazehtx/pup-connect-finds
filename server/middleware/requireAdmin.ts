import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

export async function requireAdmin(req: any, res: Response, next: NextFunction) {
  try {
    console.log('[REQUIRE ADMIN] Checking admin access:', {
      hasUser: !!req.user,
      userId: req?.user?.id,
      headers: req.headers.authorization ? 'present' : 'missing'
    });

    const userId = req?.user?.id;
    if (!userId) {
      console.log('[REQUIRE ADMIN] No user ID found in request');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const profile = await storage.getProfile(userId);

    console.log('[REQUIRE ADMIN] Profile lookup result:', {
      userId,
      hasProfile: !!profile,
      isAdmin: profile?.is_admin,
    });

    if (!profile || !profile.is_admin) {
      console.log('[REQUIRE ADMIN] Access denied - not admin');
      return res.status(403).json({ error: 'Admin access required' });
    }

    console.log('[REQUIRE ADMIN] Access granted for admin user:', userId);

    (req as any).profile = profile;
    return next();
  } catch (err) {
    console.error('[REQUIRE ADMIN] Exception:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
