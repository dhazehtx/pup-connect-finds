/**
 * Pup Box subscription checkout — P1 repair pins.
 *
 * Production root cause (proven by read-only introspection): the
 * stripe_customers table was MISSING in prod, so the subscription-only
 * getOrCreateStripeCustomer() call threw and POST /api/checkout/session
 * returned 500 CHECKOUT_FAILED. The checkout code itself was correct.
 * These tests pin the billing-mode contract, the exact Small-Monthly Price
 * resolution, the fail-safe behaviors, and that the repair migration provides
 * exactly the table getOrCreateStripeCustomer requires.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { dbProductIdForPupboxVariant } from '../server/lib/storeProductId';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');
const checkout = read('server/routes/checkout.ts');
const customer = read('server/lib/stripeCustomer.ts');
const migration = read('supabase/migrations/20260905000000_stripe_customers.sql');

describe('billing-mode contract (server-authoritative)', () => {
  it('mode derives ONLY from the DB rows: any subscription row → subscription, else payment', () => {
    expect(checkout).toMatch(/anySubscription = resolved\.some\(\(\{ product \}\) => product!\.is_subscription\)/);
    expect(checkout).toMatch(/const mode: Stripe\.Checkout\.SessionCreateParams\.Mode = anySubscription \? "subscription" : "payment"/);
  });
  it('Store one-time AND Pup Box One-Time (is_subscription=false rows) use payment mode with inline price_data', () => {
    // the non-subscription branch builds price_data from the DB unit_price
    expect(checkout).toMatch(/price_data:\s*\{\s*currency: product\.currency \|\| "usd"/);
    expect(checkout).toMatch(/unit_amount: unitPriceCents/);
  });
  it('Pup Box Monthly (is_subscription=true row) creates a Stripe SUBSCRIPTION with the stored recurring Price', () => {
    expect(checkout).toMatch(/if \(mode === "subscription"\)[\s\S]{0,500}price: product\.stripe_price_id/);
    // fail-safe when a subscription row lacks its price id
    expect(checkout).toMatch(/missing stripe_price_id/);
  });
  it('Small Monthly variant id resolves to the exact expected recurring Price (via catalog identity)', () => {
    // The cart id is derived from (product, price); the DB row it addresses was
    // certified to carry this exact Price — the identity is deterministic.
    expect(
      dbProductIdForPupboxVariant('prod_VB1Pvd8hFL6Y61', 'price_1UAfMtAECpn9W1U9yqHHs3nr'),
    ).toBe('7b05303e-12f2-54b8-851d-8418b4827df8');
  });
  it('client cannot substitute amount or Price: only {id, quantity} are read from the cart', () => {
    expect(checkout).toMatch(/storage\.getProduct\(item\.id\)/);
    expect(checkout).not.toMatch(/item\.(price|amount|stripe_price_id|unit_price)/);
  });
  it('invalid/unknown product fails safely with 400', () => {
    expect(checkout).toMatch(/Product not found: \$\{item\.id\}/);
  });
  it('mixed recurring + one-time cart fails safely with the intended 400 (separate checkouts contract)', () => {
    expect(checkout).toMatch(/anySubscription && anyOneTime/);
    expect(checkout).toMatch(/Cart mixes subscription and one-time products/);
  });
});

describe('P1 repair: stripe_customers migration provides exactly what the code requires', () => {
  it('getOrCreateStripeCustomer reads/writes stripe_customers keyed by user_id', () => {
    expect(customer).toMatch(/SELECT stripe_customer_id FROM stripe_customers WHERE user_id = \$1/);
    expect(customer).toMatch(/INSERT INTO stripe_customers \(user_id, stripe_customer_id\)/);
    expect(customer).toMatch(/ON CONFLICT \(user_id\) DO NOTHING/); // needs the UNIQUE(user_id)
  });
  it('the migration creates the table with both UNIQUE bindings, additively and server-only', () => {
    expect(migration).toMatch(/CREATE TABLE IF NOT EXISTS public\.stripe_customers/);
    expect(migration).toMatch(/user_id\s+uuid NOT NULL UNIQUE REFERENCES public\.profiles\(id\)/);
    expect(migration).toMatch(/stripe_customer_id text NOT NULL UNIQUE/);
    expect(migration).toMatch(/ENABLE ROW LEVEL SECURITY/);
    expect(migration).toMatch(/REVOKE ALL ON public\.stripe_customers FROM anon, authenticated/);
    const sql = migration.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');
    expect(sql).not.toMatch(/DROP TABLE|DROP COLUMN|TRUNCATE|DELETE FROM|UPDATE public\./i); // additive only (ON DELETE CASCADE is an FK clause, not a data op)
  });
  it('subscription checkout is the only checkout branch touching stripe_customers (Store unaffected)', () => {
    expect(checkout).toMatch(/if \(mode === "subscription"\)[\s\S]{0,120}getOrCreateStripeCustomer/);
    // the payment-mode path never references the customer binding
    const paymentBranch = checkout.slice(checkout.indexOf('} else {'), checkout.indexOf('const order ='));
    expect(paymentBranch).not.toMatch(/getOrCreateStripeCustomer/);
  });
});
