/**
 * Authoritative PAWS MEMBERSHIP plan configuration — the single source of truth
 * for which paid membership tiers exist and which Stripe Price each maps to.
 *
 * This is MEMBERSHIP only (paid account tier / entitlements). It is deliberately
 * separate from Pup Box physical-product subscriptions.
 *
 * Price IDs are read from environment (TEST while we remain in Stripe TEST) — we
 * never hard-code Stripe Price IDs. A tier is only "available" for purchase once
 * its Price env var is set, so the system fails safe when configuration is
 * missing instead of charging against a guessed/placeholder price.
 *
 * OWNER ACTION (dashboard): create TEST Products/Prices for these tiers and set
 * the corresponding env vars — see priceEnv below. Do not invent business pricing.
 */

export type MembershipTier = 'pro' | 'business';

export interface MembershipPlan {
  /** PAWS tier identifier (also the entitlement identifier). */
  tier: MembershipTier;
  entitlement: MembershipTier;
  interval: 'month';
  /** Env var holding the Stripe (TEST) recurring Price ID for this plan. */
  priceEnv: string;
  /** Resolved Stripe Price ID, or null when not configured. */
  priceId: string | null;
}

const PLAN_DEFS: { tier: MembershipTier; interval: 'month'; priceEnv: string }[] = [
  { tier: 'pro', interval: 'month', priceEnv: 'STRIPE_PRICE_MEMBERSHIP_PRO_MONTHLY' },
  { tier: 'business', interval: 'month', priceEnv: 'STRIPE_PRICE_MEMBERSHIP_BUSINESS_MONTHLY' },
];

/** All defined plans, with their Price ID resolved from env (null if unset). */
export function getMembershipPlans(): MembershipPlan[] {
  return PLAN_DEFS.map((d) => ({
    ...d,
    entitlement: d.tier,
    priceId: (process.env[d.priceEnv] || '').trim() || null,
  }));
}

/** Only the plans that are actually purchasable right now (Price configured). */
export function getConfiguredMembershipPlans(): MembershipPlan[] {
  return getMembershipPlans().filter((p) => p.priceId);
}

export function getMembershipPlanByTier(tier: string): MembershipPlan | null {
  return getMembershipPlans().find((p) => p.tier === tier) ?? null;
}

/** Map a Stripe Price ID back to a membership plan — only if it is an allowed, configured plan. */
export function getMembershipPlanByPriceId(priceId: string | null | undefined): MembershipPlan | null {
  if (!priceId) return null;
  return getConfiguredMembershipPlans().find((p) => p.priceId === priceId) ?? null;
}

/** True when at least one membership tier is configured for purchase. */
export function isMembershipConfigured(): boolean {
  return getConfiguredMembershipPlans().length > 0;
}

/** A requested tier is acceptable only if it is a known plan with a configured Price. */
export function isAllowedMembershipTier(tier: string): boolean {
  const p = getMembershipPlanByTier(tier);
  return Boolean(p && p.priceId);
}

/** A requested Price ID is acceptable only if it belongs to a configured membership plan. */
export function isAllowedMembershipPriceId(priceId: string): boolean {
  return Boolean(getMembershipPlanByPriceId(priceId));
}
