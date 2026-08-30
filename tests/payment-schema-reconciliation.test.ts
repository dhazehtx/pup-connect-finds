/**
 * Production payment-schema reconciliation — structural guards.
 *
 * Verifies the four cutover migrations (providers capabilities, deals tables,
 * memberships, service-booking payments) are additive/idempotent/non-destructive,
 * that their columns match what the code at HEAD actually reads/writes, and that
 * the service-booking amount/date fields the code uses are the authoritative ones
 * (production drift fields total_amount/booking_date are NOT used).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');
const MIGS = {
  providers: 'supabase/migrations/20260903000000_providers_connect_capabilities.sql',
  deals: 'supabase/migrations/20260904000000_deals_protected_payments.sql',
  memberships: 'supabase/migrations/20260901000000_memberships.sql',
  serviceBookings: 'supabase/migrations/20260902000000_service_booking_payments.sql',
};

// ─────────────────────────── safety: additive + idempotent ───────────────────────────
describe('all four cutover migrations are additive, idempotent, non-destructive', () => {
  for (const [name, file] of Object.entries(MIGS)) {
    it(`${name} has no destructive statements and is idempotent`, () => {
      const sql = read(file)
        .split('\n')
        .filter((l) => !l.trim().startsWith('--'))
        .join('\n');
      expect(sql).not.toMatch(/DROP TABLE|DROP COLUMN|TRUNCATE|DELETE FROM/i);
      expect(sql).not.toMatch(/UPDATE\s+public\.(profiles|dog_listings|providers|service_bookings)\s+SET/i); // no data backfill
      expect(sql).toMatch(/IF NOT EXISTS/);
    });
  }
});

// ─────────────────────────── providers capability columns ───────────────────────────
describe('providers migration supplies every column the code reads/writes', () => {
  const sql = read(MIGS.providers);
  const needed = [
    'charges_enabled', 'payouts_enabled', 'requirements_due', 'onboarding_status',
    'payout_setup_complete', 'onboarding_last_checked_at', 'background_check_status', 'updated_at',
  ];
  it('adds all 8 required columns', () => {
    for (const col of needed) expect(sql).toContain(col);
  });
  it('capability fields fail safe (DEFAULT false) — never invented as enabled', () => {
    expect(sql).toMatch(/charges_enabled\s+boolean NOT NULL DEFAULT false/);
    expect(sql).toMatch(/payouts_enabled\s+boolean NOT NULL DEFAULT false/);
    // background check state is NOT invented (nullable, no default)
    expect(sql).not.toMatch(/background_check_status\s+text\s+(NOT NULL|DEFAULT)/);
  });
  it('keeps stripe_connected (compatibility — not dropped)', () => {
    expect(sql).not.toMatch(/DROP.*stripe_connected/i);
  });
  it('matches the webhook writer columns (upsertProviderStatus)', () => {
    const h = read('server/lib/stripe-handlers.ts');
    for (const col of ['charges_enabled', 'payouts_enabled', 'requirements_due', 'onboarding_status', 'payout_setup_complete']) {
      expect(h).toContain(col);
    }
  });
});

// ─────────────────────────── deals DDL matches code queries ───────────────────────────
describe('deals migration matches the Drizzle schema + code queries', () => {
  const sql = read(MIGS.deals);
  it('creates the four tables', () => {
    for (const t of ['public.deals', 'public.deal_payments', 'public.deal_payouts', 'public.deal_disputes']) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${t}`);
    }
  });
  it('has the unique constraints the webhook/release idempotency relies on', () => {
    expect(sql).toMatch(/stripe_payment_intent_id text UNIQUE/);
    expect(sql).toMatch(/stripe_transfer_id text UNIQUE/);
  });
  it('deal columns cover every field deals.ts reads/writes', () => {
    for (const col of [
      'listing_id', 'buyer_id', 'seller_id', 'total_price_cents', 'deposit_cents', 'balance_cents',
      'platform_fee_cents', 'status', 'handoff_code', 'reserved_until', 'delivered_at',
      'confirmed_at', 'dispute_window_ends', 'released_at',
    ]) expect(sql).toContain(col);
    for (const col of ['opened_by', 'reason', 'description', 'resolution', 'resolved_by', 'resolved_at']) {
      expect(sql).toContain(col); // deal_disputes
    }
    expect(sql).toContain('seller_account_id'); // deal_payouts
  });
  it('is server-only: RLS enabled, client roles revoked, no client policies', () => {
    expect(sql).toMatch(/ENABLE ROW LEVEL SECURITY/);
    expect(sql).toMatch(/REVOKE ALL ON public\.deals/);
    expect(sql).not.toMatch(/CREATE POLICY/);
  });
});

// ─────────────────────────── memberships completeness vs code ───────────────────────────
describe('memberships migration is complete for the code at HEAD', () => {
  const sql = read(MIGS.memberships);
  it('creates every column the entitlement/sync code touches', () => {
    const needed = [
      'user_id', 'stripe_customer_id', 'stripe_subscription_id', 'stripe_price_id',
      'tier', 'status', 'cancel_at_period_end', 'current_period_end',
    ];
    for (const col of needed) expect(sql).toContain(col);
    // the sync upsert keys on user_id — the UNIQUE constraint must exist
    expect(sql).toMatch(/user_id\s+uuid NOT NULL UNIQUE/);
    // entitlement reads + sync writes reference exactly these columns
    const ent = read('server/lib/entitlements.ts');
    expect(ent).toMatch(/SELECT tier, status, cancel_at_period_end, current_period_end/);
    const sync = read('server/lib/membershipSync.ts');
    expect(sync).toMatch(/ON CONFLICT \(user_id\) DO UPDATE/);
  });
  it('is server-write-only with user self-read', () => {
    expect(sql).toMatch(/ENABLE ROW LEVEL SECURITY/);
    expect(sql).toMatch(/FOR SELECT/);
    expect(sql).toMatch(/REVOKE INSERT, UPDATE, DELETE/);
  });
});

// ─────────────────── service bookings: authoritative fields + drift ruling ───────────────────
describe('service-booking payments use the authoritative fields, not the drift columns', () => {
  it('the payment path reads total_price + service_date; never total_amount/booking_date', () => {
    const lib = read('server/lib/serviceBookingPayments.ts');
    expect(lib).toMatch(/b\.total_price\s+AS total_price/);
    for (const f of ['server/lib/serviceBookingPayments.ts', 'server/routes/serviceBookingPayments.ts']) {
      const src = read(f);
      expect(src).not.toMatch(/total_amount|booking_date|commission_amount|commission_rate/);
    }
    // booking creation writes the authoritative fields
    const services = read('server/routes/services.ts');
    expect(services).toMatch(/service_date: startAt/);
    expect(services).toMatch(/total_price: totalPrice\.toString\(\)/);
  });
  it('the migration only ADDs payment columns (safe against the observed prod table)', () => {
    const sql = read(MIGS.serviceBookings);
    expect(sql).toMatch(/ALTER TABLE public\.service_bookings/);
    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS stripe_payment_intent_id/); // prod already has it → skipped safely
    for (const col of ['amount_cents', 'platform_fee_cents', 'provider_amount_cents', 'payment_status', 'stripe_transfer_id', 'payout_status']) {
      expect(sql).toContain(col);
    }
  });
});
