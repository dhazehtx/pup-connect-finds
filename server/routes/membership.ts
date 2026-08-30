/**
 * PAWS MEMBERSHIP API — the single reachable, authoritative membership purchase +
 * management path. MEMBERSHIP only (paid account tier / entitlements); distinct
 * from Pup Box product subscriptions.
 *
 * Guarantees:
 *  - Plans are server-authoritative: the client sends a tier NAME only; the
 *    server maps it to an allowed, configured Stripe Price. A client can never
 *    submit an arbitrary Price ID or tier.
 *  - user ↔ Stripe customer binding is by authenticated user id (never email),
 *    via getOrCreateStripeCustomer(userId).
 *  - Membership is NOT granted by the success redirect — only by verified Stripe
 *    webhook events (see server/lib/membershipSync.ts). This route only starts
 *    checkout / manages the caller's OWN subscription.
 */
import { Router, type Request, type Response } from 'express';
import { Pool } from '@neondatabase/serverless';
import { requireAuth } from '../middleware/auth';
import { getStripe } from '../lib/stripeLazy';
import { getOrCreateStripeCustomer } from '../lib/stripeCustomer';
import { getUserMembership, requireMembership } from '../lib/entitlements';
import {
  getConfiguredMembershipPlans,
  getMembershipPlanByTier,
  isMembershipConfigured,
} from '../lib/membershipPlans';

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/** Public: the membership tiers currently available for purchase (no secrets). */
router.get('/plans', (_req: Request, res: Response) => {
  const plans = getConfiguredMembershipPlans().map((p) => ({
    tier: p.tier,
    entitlement: p.entitlement,
    interval: p.interval,
  }));
  res.json({ configured: isMembershipConfigured(), plans });
});

/** The caller's authoritative membership state (from trusted DB state). */
router.get('/status', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user.id as string;
  const membership = await getUserMembership(userId);
  res.json(membership);
});

/**
 * Member-only endpoint demonstrating server-side entitlement enforcement. The
 * requireMembership() guard admits only users whose trusted (webhook-synced)
 * membership is active — a client cannot reach this by forging a tier, editing
 * local storage, or calling the API directly. Reuse requireMembership(tier?) to
 * protect future premium routes.
 */
router.get('/perks', requireAuth, requireMembership(), (req: Request, res: Response) => {
  const membership = (req as any).membership;
  res.json({ ok: true, tier: membership?.tier ?? null });
});

/** Start a Stripe (TEST) subscription checkout for an allowed membership tier. */
router.post('/checkout', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id as string;
    const email = (req as any).user?.email as string | undefined;
    const { tier } = req.body ?? {};

    const plan = getMembershipPlanByTier(String(tier));
    if (!plan || !plan.priceId) {
      // Unknown tier, or the tier's Stripe Price is not configured → fail safe.
      return res.status(400).json({
        error: 'Unknown or unavailable membership tier',
        code: 'INVALID_MEMBERSHIP_TIER',
      });
    }

    const customerId = await getOrCreateStripeCustomer(userId, email);
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: userId,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      // Marker so the webhook routes this to membership logic, never Pup Box.
      metadata: { userId, tier: plan.tier, kind: 'membership' },
      subscription_data: { metadata: { userId, tier: plan.tier, kind: 'membership' } },
      success_url: `${baseUrl}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscription-cancelled`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('[MEMBERSHIP] checkout error:', (err as Error)?.message);
    res.status(500).json({ error: 'Failed to start membership checkout' });
  }
});

/** Look up the caller's OWN membership subscription id (ownership-scoped). */
async function getOwnSubscriptionId(userId: string): Promise<string | null> {
  try {
    const { rows } = await pool.query<{ stripe_subscription_id: string | null }>(
      'SELECT stripe_subscription_id FROM memberships WHERE user_id = $1 LIMIT 1',
      [userId],
    );
    return rows[0]?.stripe_subscription_id ?? null;
  } catch {
    return null;
  }
}

/** Cancel the caller's OWN membership at period end (keeps access through the term). */
router.post('/cancel', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id as string;
    const subId = await getOwnSubscriptionId(userId);
    if (!subId) return res.status(404).json({ error: 'No active membership' });

    const stripe = getStripe();
    // Default to cancel-at-period-end so the user keeps what they paid for; the
    // webhook (subscription.updated/deleted) is what ultimately updates entitlement.
    const sub = await stripe.subscriptions.update(subId, { cancel_at_period_end: true });
    res.json({ status: sub.status, cancel_at_period_end: sub.cancel_at_period_end });
  } catch (err) {
    console.error('[MEMBERSHIP] cancel error:', (err as Error)?.message);
    res.status(500).json({ error: 'Failed to cancel membership' });
  }
});

/** Change the caller's OWN membership to another allowed tier (upgrade/downgrade). */
router.post('/change', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id as string;
    const { tier } = req.body ?? {};

    const plan = getMembershipPlanByTier(String(tier));
    if (!plan || !plan.priceId) {
      return res.status(400).json({ error: 'Unknown or unavailable membership tier', code: 'INVALID_MEMBERSHIP_TIER' });
    }

    const subId = await getOwnSubscriptionId(userId);
    if (!subId) return res.status(404).json({ error: 'No active membership' });

    const stripe = getStripe();
    const current = await stripe.subscriptions.retrieve(subId);
    const itemId = current.items.data[0]?.id;
    if (!itemId) return res.status(409).json({ error: 'Subscription has no items to change' });

    // Swap the price to the requested allowed plan. Proration uses Stripe's
    // default behaviour — the exact proration policy is an OWNER decision (see report).
    const updated = await stripe.subscriptions.update(subId, {
      items: [{ id: itemId, price: plan.priceId }],
      metadata: { userId, tier: plan.tier, kind: 'membership' },
    });
    res.json({ status: updated.status, tier: plan.tier });
  } catch (err) {
    console.error('[MEMBERSHIP] change error:', (err as Error)?.message);
    res.status(500).json({ error: 'Failed to change membership' });
  }
});

export default router;
