/**
 * Payment Sprint 3 — service-provider payments + Stripe Connect.
 *
 * Behavioural tests for the pure commission/price math, and source-level
 * regression guards for the wiring the Neon-serverless driver prevents exercising
 * over local HTTP+DB (authoritative provider derivation, the original P0s, auth,
 * idempotency, transfer safety).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { computeServiceFee, priceToCents } from '../server/lib/serviceBookingPayments';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');

// ─────────────────────────── commission math ───────────────────────────
describe('computeServiceFee — server-side, deterministic, gross = fee + provider', () => {
  it('0 bps (launch default) → no fee, provider gets the whole gross', () => {
    expect(computeServiceFee(10000, 0)).toEqual({ platformFeeCents: 0, providerAmountCents: 10000 });
  });
  it('1000 bps (10%) splits correctly and sums to gross', () => {
    const { platformFeeCents, providerAmountCents } = computeServiceFee(10000, 1000);
    expect(platformFeeCents).toBe(1000);
    expect(providerAmountCents).toBe(9000);
    expect(platformFeeCents + providerAmountCents).toBe(10000);
  });
  it('rounds the fee DOWN deterministically (provider is never short-changed by rounding up)', () => {
    // 999c @ 10% = 99.9 → floor 99; provider 900; sum preserved.
    const r = computeServiceFee(999, 1000);
    expect(r.platformFeeCents).toBe(99);
    expect(r.providerAmountCents).toBe(900);
    expect(r.platformFeeCents + r.providerAmountCents).toBe(999);
  });
  it('clamps out-of-range bps and rejects invalid gross', () => {
    expect(computeServiceFee(10000, 999999).platformFeeCents).toBe(10000); // clamped to 100%
    expect(computeServiceFee(0, 1000)).toEqual({ platformFeeCents: 0, providerAmountCents: 0 });
    expect(computeServiceFee(-5, 1000)).toEqual({ platformFeeCents: 0, providerAmountCents: 0 });
    expect(computeServiceFee(NaN, 1000)).toEqual({ platformFeeCents: 0, providerAmountCents: 0 });
  });
});

describe('priceToCents', () => {
  it('converts dollar strings/numbers to integer cents; invalid → 0', () => {
    expect(priceToCents('49.99')).toBe(4999);
    expect(priceToCents(100)).toBe(10000);
    expect(priceToCents('-5')).toBe(0);
    expect(priceToCents('abc')).toBe(0);
    expect(priceToCents(null)).toBe(0);
  });
});

// ────────────── ORIGINAL P0: provider recipient, never the buyer ──────────────
describe('P0 — payout recipient is derived from the provider, never the buyer', () => {
  const lib = read('server/lib/serviceBookingPayments.ts');
  const payouts = read('server/routes/payouts.ts');
  const routes = read('server/routes/serviceBookingPayments.ts');

  it('the authoritative derivation joins booking → provider (pet_service_providers → providers)', () => {
    expect(lib).toMatch(/JOIN pet_service_providers psp ON psp\.id = b\.provider_id/);
    expect(lib).toMatch(/LEFT JOIN providers pr ON pr\.user_id = psp\.user_id/);
  });
  it('the legacy buyer-based join is GONE (regression guard for the original wrong-recipient bug)', () => {
    // The exact bug: `JOIN providers pr ON pr.user_id = o.user_id` where o.user_id is the buyer.
    expect(payouts).not.toMatch(/pr\.user_id = o\.user_id/);
    expect(payouts).not.toMatch(/stripe\.transfers\.create/); // legacy release performs no transfers
  });
  it('the transfer destination is the derived provider Connect account, not the customer', () => {
    expect(routes).toMatch(/destination: b\.connectAccountId/);
    // release must refuse if there is no authoritative provider Connect account
    expect(routes).toMatch(/!b\.providerUserId \|\| !b\.connectAccountId/);
    // the customer id is never used as a payout destination
    expect(routes).not.toMatch(/destination:\s*b\.customerUserId/);
  });
});

// ────────────── ORIGINAL P0: /bookings/complete authentication ──────────────
describe('P0 — /api/bookings/complete is no longer unauthenticated', () => {
  const bookings = read('server/routes/bookings.ts');
  it('requires auth + admin and is idempotent', () => {
    expect(bookings).toMatch(/router\.post\('\/complete', requireAuth, requireAdmin/);
    expect(bookings).toMatch(/alreadyCompleted/);
    expect(bookings).toMatch(/status <> 'completed'/);
  });
});

// ────────────── ORIGINAL P0: booking has a real payment ──────────────
describe('P0 — service booking creates a real, server-priced Stripe payment', () => {
  const routes = read('server/routes/serviceBookingPayments.ts');
  const wh = read('server/routes/stripe/webhook.ts');
  it('/pay creates a PaymentIntent from the booking price (kind=service_booking)', () => {
    expect(routes).toMatch(/paymentIntents\.create/);
    expect(routes).toMatch(/amount: amountCents/);
    expect(routes).toMatch(/kind: 'service_booking'/);
  });
  it('the webhook marks the booking paid on payment_intent.succeeded (not the client redirect)', () => {
    expect(wh).toMatch(/kind === 'service_booking'/);
    expect(wh).toMatch(/markServiceBookingPaid\(pi\.id\)/);
  });
  it('the router is mounted', () => {
    expect(read('server/routes.ts')).toMatch(/app\.use\('\/api\/service-bookings', serviceBookingPaymentsRouter\)/);
  });
});

// ────────────── ORIGINAL P0/P1: Connect storage consolidation ──────────────
describe('P0/P1 — one authoritative Connect account field (providers.stripe_account_id)', () => {
  it('onboarding writes providers.stripe_account_id (authoritative)', () => {
    const onboard = read('server/routes/stripe/create-connect-account.ts');
    expect(onboard).toMatch(/UPDATE providers SET stripe_account_id = \$1/);
  });
  it('the payout derivation reads providers.stripe_account_id', () => {
    expect(read('server/lib/serviceBookingPayments.ts')).toMatch(/pr\.stripe_account_id\s+AS connect_account_id/);
  });
});

// ────────────── ORIGINAL P1: client-controlled payment removed ──────────────
describe('P1 — no client-controlled amount/destination in the authoritative path', () => {
  it('the legacy create-intent (client amount + destination) is neutralized (410)', () => {
    const payments = read('server/routes/payments.ts');
    expect(payments).toMatch(/ENDPOINT_SUPERSEDED/);
    expect(payments).toMatch(/status\(410\)/);
  });
  it('the authoritative /pay never reads amount or destination from the request body', () => {
    const routes = read('server/routes/serviceBookingPayments.ts');
    expect(routes).toMatch(/const amountCents = b\.totalPriceCents/); // server-derived
    expect(routes).not.toMatch(/req\.body[^;]*amount/);
    expect(routes).not.toMatch(/req\.body[^;]*destination/);
    expect(routes).not.toMatch(/req\.body[^;]*(providerStripeAccountId|stripe_account)/);
  });
});

// ────────────── authorization, ownership, idempotency, transfer safety ──────────────
describe('authorization + ownership on every money-changing service route', () => {
  const routes = read('server/routes/serviceBookingPayments.ts');
  it('pay/complete/release all require auth (no soft authMiddleware)', () => {
    expect(routes).toMatch(/router\.post\('\/:id\/pay', requireAuth/);
    expect(routes).toMatch(/router\.post\('\/:id\/complete', requireAuth/);
    expect(routes).toMatch(/router\.post\('\/:id\/release', requireAuth, requireAdmin/);
    expect(routes).not.toMatch(/authMiddleware/);
  });
  it('pay is restricted to the booking customer; complete to customer/provider/admin', () => {
    expect(routes).toMatch(/b\.customerUserId !== userId/);
    expect(routes).toMatch(/isCustomer && !isProvider && !isAdmin/);
  });
});

describe('idempotency + transfer safety', () => {
  const routes = read('server/routes/serviceBookingPayments.ts');
  const lib = read('server/lib/serviceBookingPayments.ts');
  it('payment + transfer use Stripe idempotency keys (retries never duplicate)', () => {
    expect(routes).toMatch(/idempotencyKey: `svcpay_\$\{bookingId\}`/);
    expect(routes).toMatch(/idempotencyKey: `release_\$\{bookingId\}`/);
  });
  it('release guards state (paid + completed + not already released) and verifies the account', () => {
    expect(routes).toMatch(/b\.payoutStatus === 'released'/);
    expect(routes).toMatch(/b\.paymentStatus !== 'paid'/);
    expect(routes).toMatch(/b\.status !== 'completed'/);
    expect(routes).toMatch(/!b\.chargesEnabled \|\| !b\.payoutsEnabled/);
  });
  it('a failed transfer never marks the booking released', () => {
    expect(routes).toMatch(/payout_status = 'failed'/);
    expect(routes).toMatch(/WHERE id = \$1 AND payout_status <> 'released'/);
  });
  it('webhook-driven paid/refund updates are PI-scoped and idempotent', () => {
    expect(lib).toMatch(/payment_status = 'paid'[\s\S]*WHERE stripe_payment_intent_id = \$1 AND payment_status <> 'paid'/);
    expect(lib).toMatch(/payment_status = 'refunded'[\s\S]*payment_status <> 'refunded'/);
  });
  it('a Stripe dispute blocks payout (disputed booking is not "paid", so release is refused)', () => {
    const wh = read('server/routes/stripe/webhook.ts');
    expect(wh).toMatch(/charge\.dispute\.created/);
    expect(wh).toMatch(/markServiceBookingDisputed/);
    expect(lib).toMatch(/payment_status = 'disputed'/);
  });
});
