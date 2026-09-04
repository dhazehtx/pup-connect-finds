/**
 * Protected Payment P0 completion sprint — end-to-end hardening.
 *
 * Behavioural tests for the pure financial rules (server/lib/dealRules.ts) and
 * source-level guards for the route wiring the Neon driver prevents exercising
 * over local HTTP+DB. Covers: the seller payout-eligibility purchase gate, the
 * full-payment release gate, charge-funded transfers, duplicate-payment
 * protection (deposit re-entry + balance), reservation expiry / auto-release
 * automation, admin auth unification, and the buyer post-payment journey.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  DEPOSIT_PERCENT,
  MIN_PROTECTED_PAYMENT_TOTAL_CENTS,
  RELEASABLE_DEAL_STATUSES,
  computeDealAmounts,
  isSellerPayoutReady,
  verifyFullyPaid,
  planReleaseTransfers,
  listingIsPurchasable,
  isUuid,
  clampExtensionHours,
  type DealPaymentRow,
} from '../server/lib/dealRules';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');
const deals = read('server/routes/deals.ts');
const webhook = read('server/routes/stripe/webhook.ts');

const payment = (over: Partial<DealPaymentRow>): DealPaymentRow => ({
  id: 'p1',
  kind: 'DEPOSIT',
  status: 'succeeded',
  amount_cents: 2000,
  stripe_payment_intent_id: 'pi_1',
  ...over,
});

// ─────────────────────────── amounts & commission ───────────────────────────
describe('computeDealAmounts — server-authoritative money math', () => {
  it('splits 20/80 in integer cents with no lost cent', () => {
    const a = computeDealAmounts(10000, 0, false);
    expect(a).toEqual({ depositCents: 2000, balanceCents: 8000, platformFeeCents: 0 });
    const odd = computeDealAmounts(9999, 0, false);
    expect(odd.depositCents + odd.balanceCents).toBe(9999);
  });
  it('applies fee bps, clamped to [0, 10000]', () => {
    expect(computeDealAmounts(10000, 800, false).platformFeeCents).toBe(800);
    expect(computeDealAmounts(10000, 999999, false).platformFeeCents).toBe(10000);
    expect(computeDealAmounts(10000, -50, false).platformFeeCents).toBe(0);
  });
  it('commission exemption zeroes the fee (rehoming/shelter policy)', () => {
    expect(computeDealAmounts(10000, 800, true).platformFeeCents).toBe(0);
  });
  it('the $2.50 floor derives from Stripe’s $0.50 minimum at a 20% deposit', () => {
    expect(DEPOSIT_PERCENT).toBe(20);
    expect(MIN_PROTECTED_PAYMENT_TOTAL_CENTS).toBe(250);
  });
});

// ─────────────────────────── seller payout eligibility ───────────────────────────
describe('isSellerPayoutReady — a buyer can never fund an unpayable seller', () => {
  it('requires an account AND affirmative payouts_enabled', () => {
    expect(isSellerPayoutReady({ accountId: 'acct_1', payoutsEnabled: true })).toBe(true);
  });
  it('rejects missing account, disabled payouts, and UNKNOWN capability', () => {
    expect(isSellerPayoutReady({ accountId: null, payoutsEnabled: true })).toBe(false);
    expect(isSellerPayoutReady({ accountId: 'acct_1', payoutsEnabled: false })).toBe(false);
    expect(isSellerPayoutReady({ accountId: 'acct_1', payoutsEnabled: null })).toBe(false);
  });
  it('the deposit endpoint enforces the gate BEFORE any deal is created', () => {
    const dep = deals.slice(deals.indexOf('router.post("/:listingId/deposit"'));
    const gateAt = dep.indexOf('SELLER_NOT_PAYOUT_READY');
    const insertAt = dep.indexOf('INSERT INTO deals');
    expect(gateAt).toBeGreaterThan(-1);
    expect(insertAt).toBeGreaterThan(-1);
    expect(gateAt).toBeLessThan(insertAt);
  });
});

// ─────────────────────────── FULL-PAYMENT release gate ───────────────────────────
describe('verifyFullyPaid — release requires the complete buyer obligation', () => {
  const TOTAL = 10000;
  it('no payments → not releasable', () => {
    expect(verifyFullyPaid([], TOTAL)).toBe(false);
  });
  it('deposit only → not releasable', () => {
    expect(verifyFullyPaid([payment({})], TOTAL)).toBe(false);
  });
  it('failed balance → not releasable', () => {
    expect(
      verifyFullyPaid([payment({}), payment({ id: 'p2', kind: 'BALANCE', amount_cents: 8000, status: 'failed' })], TOTAL),
    ).toBe(false);
  });
  it('pending balance → not releasable', () => {
    expect(
      verifyFullyPaid([payment({}), payment({ id: 'p2', kind: 'BALANCE', amount_cents: 8000, status: 'pending' })], TOTAL),
    ).toBe(false);
  });
  it('succeeded deposit + succeeded balance → releasable', () => {
    expect(
      verifyFullyPaid([payment({}), payment({ id: 'p2', kind: 'BALANCE', amount_cents: 8000 })], TOTAL),
    ).toBe(true);
  });
  it('refunded rows contribute nothing', () => {
    expect(
      verifyFullyPaid([payment({ status: 'refunded' }), payment({ id: 'p2', kind: 'BALANCE', amount_cents: 8000, status: 'refunded' })], TOTAL),
    ).toBe(false);
  });
  it('releaseDealFunds calls it against deal_payments before the claim', () => {
    const rel = deals.slice(deals.indexOf('async function releaseDealFunds'));
    const verifyAt = rel.indexOf('verifyFullyPaid(paymentRows');
    const claimAt = rel.indexOf("UPDATE deals SET status = 'RELEASING'");
    expect(verifyAt).toBeGreaterThan(-1);
    expect(verifyAt).toBeLessThan(claimAt);
  });
  it('RESERVED and DEPOSIT_PAID are not releasable statuses', () => {
    expect(RELEASABLE_DEAL_STATUSES).not.toContain('RESERVED');
    expect(RELEASABLE_DEAL_STATUSES).not.toContain('DEPOSIT_PAID');
  });
});

// ─────────────────────────── charge-funded transfers ───────────────────────────
describe('planReleaseTransfers — transfers draw on the deal’s own charges', () => {
  const paid = [
    payment({ id: 'dep', amount_cents: 2000, stripe_payment_intent_id: 'pi_dep' }),
    payment({ id: 'bal', kind: 'BALANCE', amount_cents: 8000, stripe_payment_intent_id: 'pi_bal' }),
  ];
  it('zero fee → the full amount is allocated across both charges', () => {
    const plan = planReleaseTransfers(paid, 10000);
    expect(plan).toEqual([
      { paymentId: 'dep', stripePaymentIntentId: 'pi_dep', amountCents: 2000 },
      { paymentId: 'bal', stripePaymentIntentId: 'pi_bal', amountCents: 8000 },
    ]);
  });
  it('commission comes out of the final charge; no item exceeds its charge', () => {
    const plan = planReleaseTransfers(paid, 9200); // 8% fee
    expect(plan.map((p) => p.amountCents)).toEqual([2000, 7200]);
    for (const [i, item] of plan.entries()) {
      expect(item.amountCents).toBeLessThanOrEqual(paid[i].amount_cents);
    }
    expect(plan.reduce((s, p) => s + p.amountCents, 0)).toBe(9200);
  });
  it('a fee larger than the balance still never over-draws a charge', () => {
    const plan = planReleaseTransfers(paid, 1500); // extreme fee: payout < deposit
    expect(plan).toEqual([{ paymentId: 'dep', stripePaymentIntentId: 'pi_dep', amountCents: 1500 }]);
  });
  it('refuses to plan against pooled balance when charges cannot cover the payout', () => {
    expect(() => planReleaseTransfers([paid[0]], 10000)).toThrow(/pooled platform balance/);
  });
  it('pending/failed payments and missing PIs are never funding sources', () => {
    expect(planReleaseTransfers([payment({ status: 'pending' }), paid[1]], 8000)).toEqual([
      { paymentId: 'bal', stripePaymentIntentId: 'pi_bal', amountCents: 8000 },
    ]);
  });
  it('the live transfer carries source_transaction + transfer_group', () => {
    expect(deals).toMatch(/source_transaction: chargeId/);
    expect(deals).toMatch(/transfer_group: `deal_\$\{deal\.id\}`/);
  });
  it('both PaymentIntents are created in the deal’s transfer_group', () => {
    const groups = deals.match(/transfer_group: `deal_\$\{dealId\}`/g) ?? [];
    expect(groups.length).toBeGreaterThanOrEqual(2); // deposit + balance PIs
  });
});

// ─────────────────────────── duplicate-payment protection ───────────────────────────
describe('duplicate charges are impossible server-side', () => {
  it('balance: succeeded payment → 409, pending PI → SAME clientSecret returned', () => {
    const bal = deals.slice(deals.indexOf('router.post("/:dealId/balance"'));
    expect(bal).toMatch(/BALANCE_ALREADY_PAID/);
    expect(bal).toMatch(/paymentIntents\.retrieve\(pending\.stripe_payment_intent_id\)/);
    expect(bal).toMatch(/return res\.json\(\{ clientSecret: pi\.client_secret/);
  });
  it('balance: a late webhook race syncs state instead of double-charging', () => {
    const bal = deals.slice(deals.indexOf('router.post("/:dealId/balance"'));
    expect(bal).toMatch(/pi\.status === "succeeded"[\s\S]*BALANCE_ALREADY_PAID/);
  });
  it('deposit: the same buyer re-entering resumes the existing PI (no second deal)', () => {
    const dep = deals.slice(deals.indexOf('router.post("/:listingId/deposit"'));
    expect(dep).toMatch(/DEPOSIT_ALREADY_PAID/);
    expect(dep).toMatch(/d\.buyer_id === userId && d\.status === "RESERVED"/);
    expect(dep).toMatch(/clientSecret: pi\.client_secret/);
  });
  it('deposit/balance creation endpoints are rate limited', () => {
    expect(deals).toMatch(/router\.post\("\/:listingId\/deposit", generalRateLimit/);
    expect(deals).toMatch(/router\.post\("\/:dealId\/balance", generalRateLimit/);
  });
});

// ─────────────────────────── automation ───────────────────────────
describe('sweep — expiry and auto-release do not depend on a human', () => {
  it('expires only unpaid RESERVED deals past reserved_until', () => {
    expect(deals).toMatch(/status = 'RESERVED' AND d\.reserved_until IS NOT NULL AND d\.reserved_until < NOW\(\)/);
    expect(deals).toMatch(/NOT EXISTS \(SELECT 1 FROM deal_payments dp WHERE dp\.deal_id = d\.id AND dp\.status = 'succeeded'\)/);
    expect(deals).toMatch(/SET status = 'EXPIRED'[\s\S]*WHERE id = \$1 AND status = 'RESERVED'/);
  });
  it('cancels still-confirmable PIs first so a stale tab cannot pay an expired deal', () => {
    const sweep = deals.slice(deals.indexOf('export async function sweepProtectedPaymentDeals'));
    const cancelAt = sweep.indexOf('paymentIntents.cancel');
    const expireAt = sweep.indexOf("SET status = 'EXPIRED'");
    expect(cancelAt).toBeGreaterThan(-1);
    expect(cancelAt).toBeLessThan(expireAt);
    expect(sweep).toMatch(/paidMeanwhile/);
  });
  it('auto-releases only DELIVERED_CONFIRMED deals past the dispute window, via releaseDealFunds', () => {
    expect(deals).toMatch(/status = 'DELIVERED_CONFIRMED' AND dispute_window_ends IS NOT NULL AND dispute_window_ends < NOW\(\)/);
    const sweep = deals.slice(deals.indexOf('export async function sweepProtectedPaymentDeals'));
    expect(sweep).toMatch(/releaseDealFunds\(deal\)/);
  });
  it('the on-demand sweep route is admin-or-CRON_SECRET only (fails closed)', () => {
    const route = deals.slice(deals.indexOf('router.post("/jobs/sweep"'));
    expect(route.slice(0, 700)).toMatch(/CRON_SECRET/);
    expect(route.slice(0, 700)).toMatch(/is_admin === true/);
    expect(route.slice(0, 700)).toMatch(/status\(403\)/);
  });
  it('the scheduler is actually started at boot (not another dormant module)', () => {
    const routes = read('server/routes.ts');
    expect(routes).toMatch(/startDealSweepScheduler\(\)/);
  });
});

// ─────────────────────────── authorization ───────────────────────────
describe('admin authorization is the single canonical is_admin flag', () => {
  it('no deals route consults req.user.role', () => {
    expect(deals).not.toMatch(/req\.user\?\.role/);
  });
  it('every privileged deals surface gates on is_admin === true', () => {
    for (const anchor of ['"/:dealId/refund"', '"/:dealId/resolve"', '"/admin/all"', '"/admin/:dealId/extend"']) {
      const seg = deals.slice(deals.indexOf(anchor));
      expect(seg.slice(0, 300)).toMatch(/is_admin === true/);
    }
  });
  it('the admin console reads use the authenticated apiRequest, not cookie fetch', () => {
    const admin = read('client/src/pages/AdminConsolePage.tsx');
    expect(admin).not.toMatch(/fetch\(`\/api\/deals[\s\S]{0,80}credentials: 'include'/);
    expect(admin).toMatch(/apiRequest\(`\/api\/deals\/admin\/all/);
  });
});

// ─────────────────────────── cancellation safety ───────────────────────────
describe('cancel can never orphan collected money', () => {
  it('released/releasing deals cannot be canceled; paid deals demand the refund path', () => {
    const cancel = deals.slice(deals.indexOf('router.post("/:dealId/cancel"'));
    expect(cancel).toMatch(/\["RELEASED", "RELEASING"\]\.includes\(deal\.status\)/);
    expect(cancel).toMatch(/REFUND_REQUIRED/);
  });
  it('pending PaymentIntents are killed, and a just-completed payment aborts the cancel', () => {
    const cancel = deals.slice(deals.indexOf('router.post("/:dealId/cancel"'));
    expect(cancel).toMatch(/paymentIntents\.cancel/);
    expect(cancel).toMatch(/PAYMENT_COMPLETED/);
  });
});

// ─────────────────────────── webhook reconciliation ───────────────────────────
describe('webhook keeps deal payout records honest', () => {
  it('a transfer reversal is written back to deal_payouts and flagged loudly', () => {
    expect(webhook).toMatch(/transfer\.metadata\?\.deal_id/);
    expect(webhook).toMatch(/UPDATE deal_payouts SET status = 'reversed'/);
  });
});

// ─────────────────────────── buyer journey ───────────────────────────
describe('the paid buyer is never stranded', () => {
  it('checkout returns the buyer to the deal page (server-derived dealId)', () => {
    const checkout = read('client/src/pages/DealCheckout.tsx');
    expect(checkout).toMatch(/returnPath: `\/deals\/\$\{r\.dealId\}`/);
    expect(checkout).toMatch(/returnPath: `\/deals\/\$\{dealId\}`/);
  });
  it('the fallback status view always offers a way forward', () => {
    const form = read('client/src/components/payments/ProtectedPaymentForm.tsx');
    expect(form).toMatch(/View your protected payment/);
  });
  it('sign-in preserves the intended destination (?next= honored by Auth.tsx)', () => {
    const guard = read('client/src/components/RequireAuth.tsx');
    expect(guard).toMatch(/\/auth\?next=\$\{nextParam\}/);
    const auth = read('client/src/pages/Auth.tsx');
    expect(auth).toMatch(/searchParams\.get\('next'\)/);
  });
  it('the deal page treats redirect_status as informational, never authoritative', () => {
    const detail = read('client/src/pages/DealDetail.tsx');
    expect(detail).toMatch(/redirect_status/);
    expect(detail).toMatch(/waiting for confirmation/i);
  });
  it('a seller who is not payout-ready gets a fix-it path on the deal page', () => {
    const detail = read('client/src/pages/DealDetail.tsx');
    expect(detail).toMatch(/payouts_enabled !== true/);
    expect(detail).toMatch(/\/api\/payout\/start/);
  });
});

// ─────────────────────────── input & error hygiene ───────────────────────────
describe('input validation and non-leaky errors', () => {
  it('isUuid accepts v4 ids and rejects junk/injection shapes', () => {
    expect(isUuid('a3bb189e-8bf9-3888-9912-ace4e6543002')).toBe(true);
    expect(isUuid('jobs')).toBe(false);
    expect(isUuid("1'; DROP TABLE deals;--")).toBe(false);
    expect(isUuid('')).toBe(false);
    expect(isUuid(null)).toBe(false);
  });
  it('clampExtensionHours bounds admin extensions to [1, 720]', () => {
    expect(clampExtensionHours(72)).toBe(72);
    expect(clampExtensionHours(0)).toBe(1);
    expect(clampExtensionHours(99999)).toBe(720);
    expect(clampExtensionHours('nonsense')).toBe(72);
  });
  it('listingIsPurchasable matches the browsable statuses', () => {
    expect(listingIsPurchasable('active', null)).toBe(true);
    expect(listingIsPurchasable(null, 'available')).toBe(true);
    expect(listingIsPurchasable('sold', 'reserved')).toBe(false);
  });
  it('500 responses never echo raw driver/Stripe error messages', () => {
    expect(deals).not.toMatch(/status\(500\)\.json\(\{ error: error\.message \}\)/);
  });
});
