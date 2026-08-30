/**
 * Server-side MEMBERSHIP entitlement — the authoritative answer to
 * "does authenticated user X currently have an active PAWS membership (tier Y)?"
 *
 * Entitlement derives ONLY from the `memberships` table, whose state is
 * synchronized from verified Stripe webhook events (never from a client redirect,
 * request body, tier name, or local storage). A client cannot self-grant access.
 *
 * Fails safe: if the memberships table is absent (pre-migration) or a query
 * errors, the user is treated as NOT entitled.
 */
import { Pool } from '@neondatabase/serverless';
import type { Request, Response, NextFunction } from 'express';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/** Stripe subscription statuses that grant access outright. */
const ACTIVE_STATUSES = new Set(['active', 'trialing']);

export interface MembershipState {
  tier: string | null;
  status: string; // Stripe subscription status, or 'none'
  active: boolean; // entitled right now
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
}

const NO_MEMBERSHIP: MembershipState = {
  tier: null,
  status: 'none',
  active: false,
  cancelAtPeriodEnd: false,
  currentPeriodEnd: null,
};

/**
 * Pure, deterministic entitlement decision. Exported for unit testing.
 * - active/trialing → entitled.
 * - canceled but flagged cancel-at-period-end and still within the paid period
 *   → entitled (the user paid through the end of the term).
 * - anything else (past_due, unpaid, incomplete, incomplete_expired, canceled
 *   past the period) → NOT entitled.
 */
export function isMembershipEntitlementActive(
  status: string,
  cancelAtPeriodEnd: boolean,
  currentPeriodEnd: Date | null,
  now: Date,
): boolean {
  if (ACTIVE_STATUSES.has(status)) return true;
  if (
    status === 'canceled' &&
    cancelAtPeriodEnd &&
    currentPeriodEnd instanceof Date &&
    !Number.isNaN(currentPeriodEnd.getTime()) &&
    currentPeriodEnd.getTime() > now.getTime()
  ) {
    return true;
  }
  return false;
}

/** Read the caller's authoritative membership state from trusted DB state. */
export async function getUserMembership(userId: string, now: Date = new Date()): Promise<MembershipState> {
  if (!userId) return NO_MEMBERSHIP;
  try {
    const { rows } = await pool.query<{
      tier: string;
      status: string;
      cancel_at_period_end: boolean;
      current_period_end: string | null;
    }>(
      `SELECT tier, status, cancel_at_period_end, current_period_end
       FROM memberships WHERE user_id = $1 LIMIT 1`,
      [userId],
    );
    const row = rows[0];
    if (!row) return NO_MEMBERSHIP;
    const cpe = row.current_period_end ? new Date(row.current_period_end) : null;
    const active = isMembershipEntitlementActive(row.status, row.cancel_at_period_end, cpe, now);
    return {
      // Only surface a tier while the entitlement is actually active.
      tier: active ? row.tier : null,
      status: row.status,
      active,
      cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
      currentPeriodEnd: cpe ? cpe.toISOString() : null,
    };
  } catch {
    // memberships table missing (pre-migration) or transient error → fail safe.
    return NO_MEMBERSHIP;
  }
}

/** True when the user has any active membership (optionally of a specific tier). */
export async function hasActiveMembership(userId: string, tier?: string): Promise<boolean> {
  const m = await getUserMembership(userId);
  if (!m.active) return false;
  return tier ? m.tier === tier : true;
}

/**
 * Reusable Express guard for membership-gated routes. Requires authentication
 * (401), then an active membership (403 MEMBERSHIP_REQUIRED), optionally of a
 * specific tier (403 MEMBERSHIP_TIER_REQUIRED). Attaches req.membership.
 */
export function requireMembership(requiredTier?: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const membership = await getUserMembership(userId);
    if (!membership.active) {
      return res.status(403).json({ error: 'Active membership required', code: 'MEMBERSHIP_REQUIRED' });
    }
    if (requiredTier && membership.tier !== requiredTier) {
      return res
        .status(403)
        .json({ error: `Membership tier '${requiredTier}' required`, code: 'MEMBERSHIP_TIER_REQUIRED' });
    }
    (req as any).membership = membership;
    next();
  };
}
