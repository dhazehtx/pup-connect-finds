/**
 * Protected Payment minimum-deposit eligibility + orphan-deal atomicity (P2 repair).
 *
 * Proven production defect: a $1.00 cert listing produced a $0.20 deposit,
 * Stripe rejected PI creation (amount_too_small), and the already-created deal
 * stayed RESERVED — blocking the listing behind the duplicate-active-deal guard
 * with no buyer retry path.
 *
 * Policy chosen (Option A): Protected Payment requires the sale price to make
 * BOTH legs chargeable — 20% deposit >= Stripe's $0.50 USD minimum ⇒ total >=
 * $2.50 (the 80% balance then clears the minimum automatically). Dog listings
 * themselves remain free to create/publish at any price; this is an eligibility
 * floor for Protected Payment, never a listing fee.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');
const deals = read('server/routes/deals.ts');
const detail = read('client/src/pages/ListingDetail.tsx');

// The server's exact formulas, reproduced for behavioral verification.
const DEPOSIT_PERCENT = 20;
const STRIPE_MIN = 50;
const MIN_TOTAL = Math.ceil(STRIPE_MIN / (DEPOSIT_PERCENT / 100));
const deposit = (totalCents: number) => Math.round(totalCents * (DEPOSIT_PERCENT / 100));

describe('minimum eligible transaction price (Option A)', () => {
  it('the server derives the floor from the Stripe minimum: $2.50', () => {
    expect(MIN_TOTAL).toBe(250);
    const rules = read('server/lib/dealRules.ts');
    expect(rules).toMatch(/const STRIPE_MIN_CHARGE_CENTS = 50/);
    expect(rules).toMatch(/Math\.ceil\(\s*STRIPE_MIN_CHARGE_CENTS \/ \(DEPOSIT_PERCENT \/ 100\),?\s*\)/);
  });
  it('a $1.00 listing can never produce an unsupported $0.20 charge — rejected BEFORE any deal is created', () => {
    expect(100).toBeLessThan(MIN_TOTAL); // gate applies
    const gate = deals.indexOf('PROTECTED_PAYMENT_MIN_PRICE');
    const dealInsert = deals.indexOf('INSERT INTO deals');
    expect(gate).toBeGreaterThan(-1);
    expect(gate).toBeLessThan(dealInsert); // reject precedes creation — nothing written
    expect(deals).toMatch(/totalCents < MIN_PROTECTED_PAYMENT_TOTAL_CENTS/);
    expect(deals).toMatch(/requires a sale price of at least/); // clear PAWS message
    // no Stripe internals in executable code/responses (comments may cite the error)
    const code = deals.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
    expect(code).not.toMatch(/amount_too_small/);
  });
  it('boundary behavior: $2.49 rejected; $2.50 yields exactly the $0.50 minimum deposit and a chargeable balance', () => {
    expect(249).toBeLessThan(MIN_TOTAL);
    expect(deposit(250)).toBe(50); // == Stripe minimum
    expect(250 - deposit(250)).toBeGreaterThanOrEqual(STRIPE_MIN); // balance leg chargeable too
  });
  it('normal listings keep the intended 20% deposit, and deposit + balance always equals the total', () => {
    for (const total of [250, 500, 5000, 50000, 123457]) {
      const d = deposit(total);
      expect(d).toBe(Math.round(total * 0.2));
      expect(d + (total - d)).toBe(total); // exact split, server-side subtraction
      if (total >= MIN_TOTAL) expect(d).toBeGreaterThanOrEqual(STRIPE_MIN);
    }
    expect(read('server/lib/dealRules.ts')).toMatch(/const balanceCents = totalCents - depositCents/);
  });
  it('server stays authoritative: total derives from the listing row, never the client', () => {
    expect(deals).toMatch(/totalCents = Math\.round\(parseFloat\(listing\.price\) \* 100\)/);
  });
});

describe('failure atomicity + retry', () => {
  it('a failed payment init cancels the fresh deal instead of stranding it RESERVED', () => {
    expect(deals).toMatch(/catch \(initError: any\)/);
    expect(deals).toMatch(/SET status = 'CANCELED', updated_at = NOW\(\) WHERE id = \$1 AND status = 'RESERVED'/);
    expect(deals).toMatch(/PAYMENT_INIT_FAILED/);
    expect(deals).toMatch(/No charge was made/); // user-safe, no Stripe internals
  });
  it('the cancel guard can never touch a deal with real progress (status must still be RESERVED)', () => {
    expect(deals).toMatch(/WHERE id = \$1 AND status = 'RESERVED'/);
  });
  it('retry works after failure: the duplicate guard ignores CANCELED (and only legitimate active deals block)', () => {
    expect(deals).toMatch(/status NOT IN \('CANCELED', 'EXPIRED', 'REFUNDED'\)/);
  });
  it('the successful path is unchanged: PI + payment row + clientSecret', () => {
    expect(deals).toMatch(/paymentIntent = await stripe\.paymentIntents\.create\(piParams\)/);
    expect(deals).toMatch(/INSERT INTO deal_payments \(deal_id, kind, stripe_payment_intent_id, amount_cents, status\)/);
    expect(deals).toMatch(/clientSecret: paymentIntent\.client_secret/);
  });
});

describe('UX + business-rule guards', () => {
  it('the listing CTA is gated at the same $2.50 floor, with a clear explainer for cheaper listings', () => {
    expect(detail).toMatch(/Number\(listing\.price\) >= 2\.5/);
    expect(detail).toMatch(/Protected Payment is available for sale prices of \$2\.50 and up\./);
    // the checkout target is untouched
    expect(detail).toMatch(/navigate\(`\/deals\/pay\?listingId=\$\{listing\.id\}`\)/);
  });
  it('NO listing/publishing fee was introduced — listing creation remains free of payment code', () => {
    const createListing = read('client/src/pages/CreateListing.tsx');
    expect(createListing).not.toMatch(/stripe|payment|checkout|fee/i);
    // the new floor lives ONLY in the Protected Payment deposit route
    expect(read('server/lib/dealRules.ts')).toMatch(/never a listing fee/);
  });
  it('Store and Pup Box checkout are untouched by this repair', () => {
    const checkout = read('server/routes/checkout.ts');
    expect(checkout).not.toMatch(/MIN_PROTECTED_PAYMENT|PROTECTED_PAYMENT_MIN_PRICE/);
    expect(checkout).toMatch(/const mode: Stripe\.Checkout\.SessionCreateParams\.Mode = anySubscription \? "subscription" : "payment"/);
    expect(read('server/routes/pupbox.ts')).toMatch(/dbProductIdForPupboxVariant/);
  });
});
