/**
 * Payment integration sprint — end-to-end TEST-readiness guards.
 *
 * Covers the new Stripe Elements confirmation UIs (webhook-authoritative, no
 * client-controlled amount/destination, duplicate-init guarded), route
 * discoverability, commission bounds, the exact webhook event set the code
 * consumes, and a narrow legacy-containment re-check.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { getConnectAppFeeBps, getBreederPlatformFeeBps } from '../server/lib/platformFees';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');

// ─────────────────────────── Elements confirmation UIs ───────────────────────────
describe('Stripe Elements confirmation UIs are safe + webhook-authoritative', () => {
  const form = read('client/src/components/payments/ProtectedPaymentForm.tsx');
  const service = read('client/src/pages/ServiceBookingCheckout.tsx');
  const deal = read('client/src/pages/DealCheckout.tsx');

  it('uses the PUBLISHABLE key + clientSecret only (never a secret key)', () => {
    expect(form).toMatch(/VITE_STRIPE_PUBLIC_KEY/);
    expect(form).toMatch(/options=\{\{ clientSecret/);
    expect(form).not.toMatch(/SECRET_KEY/);
    expect(form).toMatch(/confirmPayment/);
  });
  it('guards against duplicate payment initialization', () => {
    expect(form).toMatch(/initedRef/);
    expect(form).toMatch(/redirect_status/); // return leg shows status, never re-inits
  });
  it('does not mark anything paid in the client — Stripe redirect only', () => {
    expect(form).not.toMatch(/payment_status|payout_status|mark.*paid/i);
  });
  it('service payment posts to /pay with NO client-sent amount/destination', () => {
    expect(service).toMatch(/\/api\/service-bookings\/\$\{bookingId\}\/pay/);
    expect(service).not.toMatch(/body:/); // the request sends no body → no client amount/destination
    expect(service).not.toMatch(/destination|providerStripeAccountId/);
  });
  it('breeder payment uses Deals deposit/balance, protected-payment wording, no false escrow claim', () => {
    expect(deal).toMatch(/\/api\/deals\/\$\{listingId\}\/deposit/);
    expect(deal).toMatch(/\/api\/deals\/\$\{dealId\}\/balance/);
    expect(deal).toMatch(/protected payment/i);
    // a disclaimer ("not a regulated escrow service") is fine; a positive escrow CLAIM is not
    expect(deal).not.toMatch(/held in escrow|escrow protection|escrow system|escrow account/i);
    expect(deal).not.toMatch(/body:/); // no client-sent amount/destination
  });
});

// ─────────────────────────── route discoverability ───────────────────────────
describe('the four payment surfaces are routed/reachable', () => {
  const app = read('client/src/App.tsx');
  it('service-booking pay and deal pay are routed; membership is NOT (v1: no paid membership)', () => {
    expect(app).toMatch(/path="\/service-bookings\/:bookingId\/pay"/);
    expect(app).toMatch(/path="\/deals\/pay"/);
    expect(app).not.toMatch(/path="\/membership"/); // product decision 2026-08-31
  });
  it('store checkout + cart remain routed', () => {
    expect(app).toMatch(/path="\/cart"/);
    expect(app).toMatch(/path="\/checkout\/success"/);
  });
});

// ─────────────────────────── commission bounds ───────────────────────────
describe('commission is server-side, bounded, deterministic, fails safe', () => {
  const OLD = { ...process.env };
  beforeEach(() => { delete process.env.CONNECT_APP_FEE_BPS; delete process.env.BREEDER_PLATFORM_FEE_BPS; });
  afterEach(() => { process.env = { ...OLD }; });

  it('service + breeder fees clamp to [0, 10000] and default to 0', () => {
    expect(getConnectAppFeeBps()).toBe(0);
    expect(getBreederPlatformFeeBps()).toBe(0);
    process.env.CONNECT_APP_FEE_BPS = '999999';
    expect(getConnectAppFeeBps()).toBe(10000); // fee can never exceed the gross
    process.env.BREEDER_PLATFORM_FEE_BPS = '20000';
    expect(getBreederPlatformFeeBps()).toBe(10000);
  });
  it('malformed config fails safe to 0 (never negative proceeds)', () => {
    process.env.CONNECT_APP_FEE_BPS = 'abc';
    expect(getConnectAppFeeBps()).toBe(0);
    process.env.CONNECT_APP_FEE_BPS = '-5';
    expect(getConnectAppFeeBps()).toBe(0);
  });
});

// ─────────────────────────── required webhook events ───────────────────────────
describe('the canonical webhook consumes exactly the required event set', () => {
  const wh = read('server/routes/stripe/webhook.ts');
  const required = [
    'checkout.session.completed',
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.paid',
    'invoice.payment_failed',
    'charge.refunded',
    'refund.created',
    'charge.dispute.created',
    'account.updated',
    'transfer.created',
    'transfer.reversed',
  ];
  it('handles every event the four flows depend on', () => {
    for (const ev of required) expect(wh).toContain(`'${ev}'`);
  });
  it('verifies the signature and is DB-idempotent', () => {
    expect(wh).toMatch(/constructEvent\(body, sig, secret\)/); // dual-secret loop
    expect(wh).toMatch(/\[STRIPE_WEBHOOK_SECRET, STRIPE_CONNECT_WEBHOOK_SECRET\]\.filter\(Boolean\)/);
    expect(wh).toMatch(/withDbIdempotency\(event\.id/);
  });
});

// ─────────────────────────── v1 monetization policy ───────────────────────────
describe('v1 monetization policy (product decision 2026-08-31)', () => {
  it('rehoming and shelter/rescue protected payments carry 0% PAWS commission', () => {
    const deals = read('server/routes/deals.ts');
    expect(deals).toMatch(/commissionExempt = listing\.rehoming === true \|\| listing\.seller_user_type === 'shelter'/);
    expect(deals).toMatch(/commissionExempt \? 0 :/);
    // the fee is derived from listing + seller type, never from the client
    expect(deals).toMatch(/l\.rehoming/);
    expect(deals).toMatch(/p\.user_type AS seller_user_type/);
  });
  it('Pup Box product subscriptions remain intact and reachable', () => {
    const routes = read('server/routes.ts');
    expect(routes).toMatch(/app\.use\('\/api\/pupbox', pupboxRouter\)/);
    expect(routes).toMatch(/app\.use\('\/api\/checkout', checkoutRouter\)/);
    // subscription-mode store checkout (the Pup Box path) still supported
    expect(read('server/routes/checkout.ts')).toMatch(/mode === "subscription"/);
  });
  it('the dormant membership API cannot grant entitlement without configured plans', () => {
    const m = read('server/routes/membership.ts');
    expect(m).toMatch(/INVALID_MEMBERSHIP_TIER/); // unconfigured tier → 400 fail-safe
    expect(m).not.toMatch(/INSERT INTO memberships/); // route never writes entitlement
  });
});

// ─────────────────────────── legacy containment (narrow re-check) ───────────────────────────
describe('legacy money paths remain contained after the sprint chain', () => {
  it('store product mutations stay admin-gated', () => {
    expect(read('server/routes/products.ts')).toMatch(/router\.post\("\/",\s*requireAuth,\s*requireAdmin/);
  });
  it('legacy service create-intent stays neutralized (410)', () => {
    expect(read('server/routes/payments.ts')).toMatch(/ENDPOINT_SUPERSEDED/);
  });
  it('legacy orders-based payout stays neutralized (no buyer join, no transfers)', () => {
    const p = read('server/routes/payouts.ts');
    expect(p).not.toMatch(/pr\.user_id = o\.user_id/);
    expect(p).not.toMatch(/stripe\.transfers\.create/);
  });
  it('legacy escrow edge functions stay retired (410)', () => {
    for (const fn of ['stripe-payment', 'release-escrow-funds', 'process-refund']) {
      expect(read(`supabase/functions/${fn}/index.ts`)).toMatch(/ESCROW_ENDPOINT_RETIRED/);
    }
  });
});
