import { debugApiLog, debugApiWarn } from '../lib/debugApi';
import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { profiles } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function requireAdmin(req: any, res: Response, next: NextFunction) {
  try {
    const userId = req?.user?.id;
    if (!userId) {
      debugApiLog('[PROOF:ADMIN:GATE]', JSON.stringify({ userId: null, role: null, ok: false, ts: Date.now() }));
      return res.status(401).json({ ok: false, code: 'AUTH_REQUIRED', error: 'Not authenticated' });
    }

    const [profile] = await db.select({
      id: profiles.id,
      role: profiles.role,
      is_admin: profiles.is_admin,
      is_suspended: profiles.is_suspended,
    }).from(profiles).where(eq(profiles.id, userId));

    if (!profile) {
      debugApiLog('[PROOF:ADMIN:GATE]', JSON.stringify({ userId, role: null, ok: false, ts: Date.now() }));
      return res.status(403).json({ ok: false, code: 'ADMIN_REQUIRED', error: 'Admin access required' });
    }

    // NOTE: moderators are granted access here for general admin/moderation
    // surfaces. Privilege-GRANTING actions (e.g. minting "verified" providers)
    // must use requireStrictAdmin instead — see below.
    const isAdminRole = profile.role === 'admin' || profile.role === 'moderator' || profile.is_admin;
    debugApiLog('[PROOF:ADMIN:GATE]', JSON.stringify({ userId, role: profile.role, ok: isAdminRole, ts: Date.now() }));

    if (!isAdminRole) {
      return res.status(403).json({ ok: false, code: 'ADMIN_REQUIRED', error: 'Admin access required' });
    }

    (req as any).profile = profile;
    return next();
  } catch (err) {
    debugApiLog('[PROOF:ADMIN:GATE] Exception:', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

/**
 * Strict admin gate: full administrators only (NOT moderators). Use for
 * trust/privilege-granting operations — provider verification, role changes,
 * financial administration — where moderator-level access is not appropriate.
 */
export async function requireStrictAdmin(req: any, res: Response, next: NextFunction) {
  try {
    const userId = req?.user?.id;
    if (!userId) {
      return res.status(401).json({ ok: false, code: 'AUTH_REQUIRED', error: 'Not authenticated' });
    }

    const [profile] = await db.select({
      id: profiles.id,
      role: profiles.role,
      is_admin: profiles.is_admin,
    }).from(profiles).where(eq(profiles.id, userId));

    const isFullAdmin = Boolean(profile) && (profile.role === 'admin' || profile.is_admin === true);
    debugApiLog('[PROOF:STRICT_ADMIN:GATE]', JSON.stringify({ userId, role: profile?.role ?? null, ok: isFullAdmin, ts: Date.now() }));

    if (!isFullAdmin) {
      return res.status(403).json({ ok: false, code: 'ADMIN_REQUIRED', error: 'Full admin access required' });
    }

    (req as any).profile = profile;
    return next();
  } catch (err) {
    debugApiLog('[PROOF:STRICT_ADMIN:GATE] Exception:', err);
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
      debugApiLog('[PROOF:SUSPEND]', JSON.stringify({ userId, suspended: true, action: 'write_blocked', ts: Date.now() }));
      return res.status(403).json({ ok: false, code: 'SUSPENDED', error: 'Your account is suspended' });
    }

    return next();
  } catch (err) {
    return next();
  }
}
