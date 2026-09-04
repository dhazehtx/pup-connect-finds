/**
 * Protected Payment (Deals) — pure, server-authoritative business rules.
 *
 * Every financial invariant lives here as a pure function so it can be tested
 * directly (the Neon driver prevents exercising the HTTP+DB path locally).
 * server/routes/deals.ts is the only consumer; nothing here touches the
 * network, Stripe, or the database.
 */

export const DEPOSIT_PERCENT = 20;
/** Stripe's minimum USD charge (amount_too_small below this). */
export const STRIPE_MIN_CHARGE_CENTS = 50;
/** Smallest sale price whose 20% deposit clears the Stripe minimum ($2.50).
 *  The 80% balance is then automatically >= the minimum too. This is an
 *  ELIGIBILITY floor for Protected Payment only — dog listings themselves stay
 *  free to create/publish at any price; this is never a listing fee. */
export const MIN_PROTECTED_PAYMENT_TOTAL_CENTS = Math.ceil(
  STRIPE_MIN_CHARGE_CENTS / (DEPOSIT_PERCENT / 100),
);

/**
 * Statuses from which funds may be RELEASED to the seller. Every status here
 * requires the buyer's FULL obligation (deposit + balance) to have succeeded —
 * the webhook only writes PAID_IN_FULL after a succeeded BALANCE payment, and
 * the later states derive from it. RESERVED/DEPOSIT_PAID are deliberately
 * absent: a deposit alone must never be releasable, even by an admin.
 */
export const RELEASABLE_DEAL_STATUSES = [
  'PAID_IN_FULL',
  'DELIVERED_PENDING_CONFIRM',
  'DELIVERED_CONFIRMED',
] as const;

/** PaymentIntent statuses whose clientSecret is still confirmable by the buyer. */
export const REUSABLE_PI_STATUSES = [
  'requires_payment_method',
  'requires_confirmation',
  'requires_action',
  'processing',
] as const;

export interface DealAmounts {
  depositCents: number;
  balanceCents: number;
  platformFeeCents: number;
}

/** Deposit/balance split and platform commission, all in integer cents. */
export function computeDealAmounts(
  totalCents: number,
  feeBps: number,
  commissionExempt: boolean,
): DealAmounts {
  const depositCents = Math.round(totalCents * (DEPOSIT_PERCENT / 100));
  const balanceCents = totalCents - depositCents;
  const clampedBps = Math.min(Math.max(Math.round(feeBps), 0), 10000);
  const platformFeeCents = commissionExempt ? 0 : Math.round(totalCents * (clampedBps / 10000));
  return { depositCents, balanceCents, platformFeeCents };
}

/**
 * A seller can receive Protected Payment funds ONLY with a Connect account whose
 * payouts capability is affirmatively enabled. `null` (unknown — e.g. a legacy
 * profiles.stripe_account_id with no providers row) is NOT eligible: unknown is
 * not "ready", and money taken for an unpayable seller wedges in the platform.
 */
export function isSellerPayoutReady(account: {
  accountId: string | null;
  payoutsEnabled: boolean | null;
}): boolean {
  return Boolean(account.accountId) && account.payoutsEnabled === true;
}

export interface DealPaymentRow {
  id: string;
  kind: string; // 'DEPOSIT' | 'BALANCE'
  status: string; // 'pending' | 'succeeded' | 'failed' | 'refunded'
  amount_cents: number;
  stripe_payment_intent_id: string | null;
}

/**
 * FULLY PAID = succeeded payments cover the deal's total price. Pending, failed
 * and refunded rows contribute nothing. This is the release gate's authority —
 * a deal status alone is never trusted for money movement.
 */
export function verifyFullyPaid(payments: DealPaymentRow[], totalPriceCents: number): boolean {
  if (!Number.isFinite(totalPriceCents) || totalPriceCents <= 0) return false;
  const paid = payments
    .filter((p) => p.status === 'succeeded')
    .reduce((sum, p) => sum + (Number.isFinite(p.amount_cents) ? p.amount_cents : 0), 0);
  return paid >= totalPriceCents;
}

export interface TransferPlanItem {
  paymentId: string;
  stripePaymentIntentId: string;
  amountCents: number;
}

/**
 * Allocate the seller payout across the succeeded charges so each Connect
 * transfer can carry `source_transaction` (funding it from that charge instead
 * of the platform's pooled available balance — otherwise release routinely
 * fails `balance_insufficient` while card funds are still settling).
 *
 * A transfer sourced from a charge may not exceed that charge's amount, so the
 * payout (total − fee) is split greedily in payment order; the commission
 * naturally comes out of the final charge(s). Throws if the succeeded charges
 * cannot cover the payout — callers must verifyFullyPaid first.
 */
export function planReleaseTransfers(
  payments: DealPaymentRow[],
  payoutCents: number,
): TransferPlanItem[] {
  if (!Number.isFinite(payoutCents) || payoutCents <= 0) return [];
  const succeeded = payments.filter(
    (p) => p.status === 'succeeded' && p.stripe_payment_intent_id && p.amount_cents > 0,
  );
  const plan: TransferPlanItem[] = [];
  let remaining = payoutCents;
  for (const p of succeeded) {
    if (remaining <= 0) break;
    const amount = Math.min(p.amount_cents, remaining);
    plan.push({
      paymentId: p.id,
      stripePaymentIntentId: p.stripe_payment_intent_id as string,
      amountCents: amount,
    });
    remaining -= amount;
  }
  if (remaining > 0) {
    throw new Error(
      `Succeeded payments cannot fund the payout (short ${remaining} cents) — refuse to draw on pooled platform balance`,
    );
  }
  return plan;
}

/** Listings browsable in Explore use both 'active' and 'available'. */
export function listingIsPurchasable(
  status: string | null | undefined,
  listingStatus: string | null | undefined,
): boolean {
  const ok = (s: string | null | undefined) => s === 'active' || s === 'available';
  return ok(status) || ok(listingStatus);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Path-parameter guard: malformed ids get a 400, never a raw Postgres 22P02 500. */
export function isUuid(value: string | null | undefined): value is string {
  return !!value && UUID_RE.test(value);
}

/** Admin reservation extension bounds (hours). */
export function clampExtensionHours(hours: unknown): number {
  const n = typeof hours === 'number' ? hours : parseFloat(String(hours));
  if (!Number.isFinite(n)) return 72;
  return Math.min(Math.max(Math.round(n), 1), 720);
}
