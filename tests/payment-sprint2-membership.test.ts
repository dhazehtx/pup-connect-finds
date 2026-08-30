/**
 * Payment Sprint 2 — PAWS Membership subscriptions.
 *
 * Behavioural tests for the pure decision surfaces (plan integrity, entitlement
 * decision, membership-vs-Pup-Box isolation mapping) and source-level regression
 * guards for the wiring the Neon-serverless driver prevents exercising over local
 * HTTP+DB (customer binding, reachable route, webhook lifecycle, ownership).
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  getMembershipPlanByTier,
  getMembershipPlanByPriceId,
  isAllowedMembershipTier,
  isAllowedMembershipPriceId,
  isMembershipConfigured,
} from '../server/lib/membershipPlans';
import { isMembershipEntitlementActive } from '../server/lib/entitlements';
import { mapStripeSubscriptionToMembership } from '../server/lib/membershipSync';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');

const PRO_PRICE = 'price_test_pro_123';
const BIZ_PRICE = 'price_test_biz_123';

// ─────────────────────────── plan integrity ───────────────────────────
describe('membership plan configuration is server-authoritative', () => {
  const OLD = { ...process.env };
  beforeEach(() => {
    process.env.STRIPE_PRICE_MEMBERSHIP_PRO_MONTHLY = PRO_PRICE;
    process.env.STRIPE_PRICE_MEMBERSHIP_BUSINESS_MONTHLY = BIZ_PRICE;
  });
  afterEach(() => { process.env = { ...OLD }; });

  it('maps a known tier to its configured Stripe price', () => {
    expect(getMembershipPlanByTier('pro')?.priceId).toBe(PRO_PRICE);
    expect(getMembershipPlanByTier('business')?.priceId).toBe(BIZ_PRICE);
    expect(isMembershipConfigured()).toBe(true);
  });
  it('rejects an arbitrary/unknown tier', () => {
    expect(getMembershipPlanByTier('platinum')).toBeNull();
    expect(isAllowedMembershipTier('platinum')).toBe(false);
    expect(isAllowedMembershipTier('')).toBe(false);
  });
  it('only accepts a Price ID that belongs to a configured plan (no arbitrary price)', () => {
    expect(isAllowedMembershipPriceId(PRO_PRICE)).toBe(true);
    expect(isAllowedMembershipPriceId('price_attacker_free')).toBe(false);
    expect(getMembershipPlanByPriceId(PRO_PRICE)?.tier).toBe('pro');
  });
  it('fails safe when a tier has no configured price', () => {
    delete process.env.STRIPE_PRICE_MEMBERSHIP_PRO_MONTHLY;
    expect(isAllowedMembershipTier('pro')).toBe(false);
    expect(getMembershipPlanByTier('pro')?.priceId).toBeNull();
  });
});

// ─────────────────────── entitlement decision (pure) ───────────────────────
describe('isMembershipEntitlementActive', () => {
  const now = new Date('2026-06-15T00:00:00Z');
  const future = new Date('2026-07-15T00:00:00Z');
  const past = new Date('2026-05-15T00:00:00Z');

  it('active/trialing → entitled', () => {
    expect(isMembershipEntitlementActive('active', false, future, now)).toBe(true);
    expect(isMembershipEntitlementActive('trialing', false, null, now)).toBe(true);
  });
  it('canceled-at-period-end but still within the paid period → entitled', () => {
    expect(isMembershipEntitlementActive('canceled', true, future, now)).toBe(true);
  });
  it('canceled past the period, or hard-canceled → NOT entitled', () => {
    expect(isMembershipEntitlementActive('canceled', true, past, now)).toBe(false);
    expect(isMembershipEntitlementActive('canceled', false, future, now)).toBe(false);
  });
  it('past_due / unpaid / incomplete → NOT entitled (no indefinite unpaid access)', () => {
    expect(isMembershipEntitlementActive('past_due', false, future, now)).toBe(false);
    expect(isMembershipEntitlementActive('unpaid', false, future, now)).toBe(false);
    expect(isMembershipEntitlementActive('incomplete', false, future, now)).toBe(false);
  });
  it('a forged/unknown status is NOT entitled', () => {
    expect(isMembershipEntitlementActive('active_lol', false, future, now)).toBe(false);
  });
});

// ─────────────── membership ↔ Pup Box isolation (pure mapping) ───────────────
describe('mapStripeSubscriptionToMembership — only membership subs, never Pup Box', () => {
  const membershipSub = {
    id: 'sub_1', customer: 'cus_1', status: 'active', cancel_at_period_end: false,
    current_period_end: 1_800_000_000,
    items: { data: [{ price: { id: PRO_PRICE } }] },
    metadata: { kind: 'membership', userId: 'user-1', tier: 'pro' },
  };

  it('a membership subscription maps to a membership upsert', () => {
    const m = mapStripeSubscriptionToMembership(membershipSub);
    expect(m).not.toBeNull();
    expect(m!.userId).toBe('user-1');
    expect(m!.tier).toBe('pro');
    expect(m!.status).toBe('active');
    expect(m!.currentPeriodEndIso).toBe(new Date(1_800_000_000 * 1000).toISOString());
  });
  it('a Pup Box / product subscription (no kind marker) is NOT a membership', () => {
    const pupbox = { ...membershipSub, metadata: { kind: 'pupbox', userId: 'user-1' } };
    expect(mapStripeSubscriptionToMembership(pupbox)).toBeNull();
    const bare = { ...membershipSub, metadata: {} };
    expect(mapStripeSubscriptionToMembership(bare)).toBeNull();
  });
  it('a membership sub with no userId, or an unknown tier + no price match, is ignored', () => {
    expect(mapStripeSubscriptionToMembership({ ...membershipSub, metadata: { kind: 'membership' } })).toBeNull();
    const weird = {
      ...membershipSub,
      items: { data: [{ price: { id: 'price_unknown' } }] },
      metadata: { kind: 'membership', userId: 'u', tier: 'platinum' },
    };
    expect(mapStripeSubscriptionToMembership(weird)).toBeNull();
  });
});

// ─────────────────── customer binding: user_id, never email ───────────────────
describe('user ↔ Stripe customer binding is by user id, not email', () => {
  it('getOrCreateStripeCustomer looks up stripe_customers by user_id', () => {
    const src = read('server/lib/stripeCustomer.ts');
    expect(src).toMatch(/FROM stripe_customers WHERE user_id = \$1/);
    expect(src).not.toMatch(/customers\.list\(\{\s*email/);
  });
  it('membership checkout binds via getOrCreateStripeCustomer(userId) — no email lookup', () => {
    const src = read('server/routes/membership.ts');
    expect(src).toMatch(/getOrCreateStripeCustomer\(userId/);
    expect(src).not.toMatch(/customers\.list/);
    expect(src).not.toMatch(/onConflict:\s*'email'/);
  });
});

// ─────────────── reachable purchase path + server plan mapping ───────────────
describe('reachable, server-authoritative membership purchase path', () => {
  const membership = read('server/routes/membership.ts');
  const app = read('client/src/App.tsx');
  it('the membership page is routed (RequireAuth) and imported', () => {
    expect(app).toMatch(/path="\/membership"/);
    expect(app).toMatch(/LazyMembership/);
  });
  it('checkout maps the client tier NAME to an allowed server price (no client price/tier trust)', () => {
    expect(membership).toMatch(/getMembershipPlanByTier\(String\(tier\)\)/);
    expect(membership).toMatch(/line_items: \[\{ price: plan\.priceId/);
    expect(membership).not.toMatch(/req\.body[^;]*priceId/);
  });
  it('membership is not granted by the route/redirect — the route never writes the memberships table', () => {
    expect(membership).not.toMatch(/INSERT INTO memberships/);
    expect(membership).not.toMatch(/UPDATE memberships/);
  });
  it('the membership router is mounted', () => {
    expect(read('server/routes.ts')).toMatch(/app\.use\('\/api\/membership', membershipRouter\)/);
  });
});

// ─────────────────────── webhook lifecycle + isolation ───────────────────────
describe('webhook establishes authoritative membership state, isolated from Pup Box', () => {
  const wh = read('server/routes/stripe/webhook.ts');
  it('customer.subscription.* events sync membership via upsertMembershipFromStripe', () => {
    expect(wh).toMatch(/customer\.subscription\.created/);
    expect(wh).toMatch(/customer\.subscription\.updated/);
    expect(wh).toMatch(/customer\.subscription\.deleted/);
    expect(wh).toMatch(/upsertMembershipFromStripe\(sub\)/);
  });
  it('membership checkout sessions are routed AWAY from the store/Pup Box fulfilment path', () => {
    expect(wh).toMatch(/metadata\?\.kind === 'membership'/);
  });
  it('membership sync writes only the memberships table, never the Pup Box subscriptions table', () => {
    const sync = read('server/lib/membershipSync.ts');
    expect(sync).toMatch(/INSERT INTO memberships/);
    expect(sync).not.toMatch(/INSERT INTO subscriptions/);
  });
  it('the upsert is idempotent (ON CONFLICT user_id DO UPDATE) on the shared DB-idempotent webhook', () => {
    expect(read('server/lib/membershipSync.ts')).toMatch(/ON CONFLICT \(user_id\) DO UPDATE/);
    expect(wh).toMatch(/withDbIdempotency\(event\.id/);
  });
});

// ─────────────────────── entitlement enforcement + ownership ───────────────────────
describe('server-side entitlement enforcement + ownership', () => {
  const membership = read('server/routes/membership.ts');
  it('a member-only route is guarded by requireMembership (server-enforced, not client)', () => {
    expect(membership).toMatch(/requireMembership\(\)/);
  });
  it('cancel/change act only on the caller\'s OWN subscription (ownership-scoped)', () => {
    expect(membership).toMatch(/getOwnSubscriptionId\(userId\)/);
    // subscription id is looked up from the caller's own row, never taken from the body
    expect(membership).toMatch(/WHERE user_id = \$1/);
    expect(membership).not.toMatch(/req\.body[^;]*subscription/i);
  });
});
