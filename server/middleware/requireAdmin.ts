import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { profiles } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function requireAdmin(req: any, res: Response, next: NextFunction) {
  try {
    const userId = req?.user?.id;
    if (!userId) {
      console.log('[PROOF:ADMIN:GATE]', JSON.stringify({ userId: null, role: null, ok: false, ts: Date.now() }));
      return res.status(401).json({ ok: false, code: 'AUTH_REQUIRED', error: 'Not authenticated' });
    }

    const [profile] = await db.select({
      id: profiles.id,
      role: profiles.role,
      is_admin: profiles.is_admin,
      is_suspended: profiles.is_suspended,
    }).from(profiles).where(eq(profiles.id, userId));

    if (!profile) {
      console.log('[PROOF:ADMIN:GATE]', JSON.stringify({ userId, role: null, ok: false, ts: Date.now() }));
      return res.status(403).json({ ok: false, code: 'ADMIN_REQUIRED', error: 'Admin access required' });
    }

    const isAdminRole = profile.role === 'admin' || profile.role === 'moderator' || profile.is_admin;
    console.log('[PROOF:ADMIN:GATE]', JSON.stringify({ userId, role: profile.role, ok: isAdminRole, ts: Date.now() }));

    if (!isAdminRole) {
      return res.status(403).json({ ok: false, code: 'ADMIN_REQUIRED', error: 'Admin access required' });
    }

    (req as any).profile = profile;
    return next();
  } catch (err) {
    console.error('[PROOF:ADMIN:GATE] Exception:', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

export async function requireNotSuspended(req: any, res: Response, next: NextFunction) {
  try {
    const userId = req?.user?.id;
    if (!userId) return next();

    const [profile] = await db.select({
      is_suspended: profiles.is_suspended,
    }).from(profiles).where(eq(profiles.id, userId));

    if (profile?.is_suspended) {
      console.log('[PROOF:SUSPEND]', JSON.stringify({ userId, suspended: true, action: 'write_blocked', ts: Date.now() }));
      return res.status(403).json({ ok: false, code: 'SUSPENDED', error: 'Your account is suspended' });
    }

    return next();
  } catch (err) {
    return next();
  }
}
