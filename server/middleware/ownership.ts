import type { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { dogListings, posts, comments } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Ownership / self-access middleware.
 *
 * These helpers assume `authMiddleware` has already run and (for authenticated
 * callers) populated `req.user`. They are the server-authoritative enforcement
 * layer: the acting identity is ALWAYS `req.user.id`, never a client-supplied
 * body/query/param `userId`. A client-supplied id may only ever be used to
 * *target* a resource whose ownership is then independently verified here.
 */

export function isAuthed(req: Request): boolean {
  return Boolean(req.isAuthenticated && req.isAuthenticated() && req.user?.id);
}

export function isAdmin(req: Request): boolean {
  return Boolean(req.user?.is_admin);
}

/** 401 if not authenticated. Mirrors requireAuth but usable inline. */
export function requireAuthed(req: Request, res: Response, next: NextFunction) {
  if ((res as any).locals?.authDegraded) {
    return res.status(503).json({
      error: 'Authentication temporarily unavailable',
      code: 'SUPABASE_DEGRADED',
    });
  }
  if (!isAuthed(req)) {
    return res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
  }
  next();
}

/**
 * Require that a `:userId`-style route/body/query param matches the
 * authenticated user (admins bypass). Use for self-scoped collections such as
 * favorites, payment history, exports.
 */
export function requireSelf(getTargetId: (req: Request) => string | undefined) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!isAuthed(req)) {
      return res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
    }
    if (isAdmin(req)) return next();
    const target = getTargetId(req);
    if (!target || target !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden', code: 'NOT_OWNER' });
    }
    next();
  };
}

type OwnedTable = 'listing' | 'post' | 'comment';

async function loadOwner(kind: OwnedTable, id: string): Promise<{ exists: boolean; ownerId: string | null }> {
  if (kind === 'listing') {
    const [row] = await db.select({ owner: dogListings.user_id }).from(dogListings).where(eq(dogListings.id, id)).limit(1);
    return { exists: Boolean(row), ownerId: row?.owner ?? null };
  }
  if (kind === 'post') {
    const [row] = await db.select({ owner: posts.user_id }).from(posts).where(eq(posts.id, id)).limit(1);
    return { exists: Boolean(row), ownerId: row?.owner ?? null };
  }
  const [row] = await db.select({ owner: comments.user_id }).from(comments).where(eq(comments.id, id)).limit(1);
  return { exists: Boolean(row), ownerId: row?.owner ?? null };
}

/**
 * Require the authenticated user to own the resource named by `:id`
 * (admins bypass). 401 unauthenticated, 404 missing, 403 not-owner.
 * The resource type is looked up server-side so a client cannot spoof ownership.
 */
export function requireOwner(kind: OwnedTable, paramName = 'id') {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!isAuthed(req)) {
      return res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
    }
    const id = req.params[paramName];
    if (!id) {
      return res.status(400).json({ error: 'Missing resource id', code: 'BAD_REQUEST' });
    }
    try {
      const { exists, ownerId } = await loadOwner(kind, id);
      if (!exists) {
        return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
      }
      if (!isAdmin(req) && ownerId !== req.user!.id) {
        return res.status(403).json({ error: 'Forbidden', code: 'NOT_OWNER' });
      }
      next();
    } catch (err) {
      console.error(`[ownership] load ${kind} ${id} failed:`, err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}
