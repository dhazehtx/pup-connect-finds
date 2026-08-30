/**
 * Sync PAWS MEMBERSHIP state from verified Stripe subscription events into the
 * dedicated `memberships` table. Uses a direct pool (never the storage/db module)
 * so it is safe to import from the canonical webhook router.
 *
 * ISOLATION: a subscription is treated as a membership ONLY when its metadata
 * carries kind==='membership' (set by our own membership checkout). Pup Box
 * product subscriptions never carry that marker, so they can never be written
 * here — and this never touches the Pup Box `subscriptions` table.
 */
import { Pool } from '@neondatabase/serverless';
import { getMembershipPlanByPriceId } from './membershipPlans';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const KNOWN_TIERS = new Set(['pro', 'business']);

export interface MembershipUpsert {
  userId: string;
  customerId: string;
  subscriptionId: string;
  priceId: string | null;
  tier: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEndIso: string | null;
}

/**
 * Pure: extract membership fields from a Stripe Subscription, or null when the
 * subscription is not a PAWS membership. Exported for unit testing (isolation).
 */
export function mapStripeSubscriptionToMembership(sub: any): MembershipUpsert | null {
  if (!sub || sub.metadata?.kind !== 'membership') return null; // isolation gate
  const userId = sub.metadata?.userId;
  if (!userId) return null;

  const priceId: string | null = sub.items?.data?.[0]?.price?.id ?? null;
  // metadata.tier is set by our own server-side checkout (trusted); fall back to
  // mapping the price to a configured plan.
  const metaTier = sub.metadata?.tier;
  const tier = KNOWN_TIERS.has(metaTier) ? metaTier : getMembershipPlanByPriceId(priceId)?.tier ?? null;
  if (!tier) return null; // not an allowed membership plan → ignore

  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
  if (!customerId) return null;

  const currentPeriodEndIso =
    typeof sub.current_period_end === 'number'
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null;

  return {
    userId,
    customerId,
    subscriptionId: sub.id,
    priceId,
    tier,
    status: sub.status || 'incomplete',
    cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
    currentPeriodEndIso,
  };
}

/**
 * Idempotent upsert of membership state keyed by user_id. Returns true if the
 * subscription was a membership and was synced. No-ops safely (returns false) if
 * the subscription is not a membership or the memberships table is absent.
 */
export async function upsertMembershipFromStripe(sub: any): Promise<boolean> {
  const m = mapStripeSubscriptionToMembership(sub);
  if (!m) return false;
  try {
    await pool.query(
      `INSERT INTO memberships (
         user_id, stripe_customer_id, stripe_subscription_id, stripe_price_id,
         tier, status, cancel_at_period_end, current_period_end, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         stripe_customer_id     = EXCLUDED.stripe_customer_id,
         stripe_subscription_id = EXCLUDED.stripe_subscription_id,
         stripe_price_id        = EXCLUDED.stripe_price_id,
         tier                   = EXCLUDED.tier,
         status                 = EXCLUDED.status,
         cancel_at_period_end   = EXCLUDED.cancel_at_period_end,
         current_period_end     = EXCLUDED.current_period_end,
         updated_at             = NOW()`,
      [
        m.userId,
        m.customerId,
        m.subscriptionId,
        m.priceId,
        m.tier,
        m.status,
        m.cancelAtPeriodEnd,
        m.currentPeriodEndIso,
      ],
    );
    console.log(`[MEMBERSHIP] synced user=${m.userId} tier=${m.tier} status=${m.status}`);
    return true;
  } catch (e) {
    // memberships table absent (pre-migration) or transient error — fail safe.
    console.error('[MEMBERSHIP] upsert failed:', (e as Error)?.message);
    return false;
  }
}
