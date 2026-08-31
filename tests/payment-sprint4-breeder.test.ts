/**
 * Payment Sprint 4 — breeder / dog-sale protected payments (Deals + Connect).
 *
 * Behavioural tests for the breeder commission config, and source-level guards
 * for the Deals money-safety fixes the Neon driver prevents exercising over local
 * HTTP+DB (release auth/idempotency, authoritative seller account, refund/dispute
 * safety, legacy escrow neutralization, and the escrow → protected-payment copy).
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { getBreederPlatformFeeBps } from '../server/lib/platformFees';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');
const deals = read('server/routes/deals.ts');

// ─────────────────────────── commission config ───────────────────────────
describe('breeder commission is server-configured (not the legacy 8%)', () => {
  const OLD = { ...process.env };
  beforeEach(() => { delete process.env.BREEDER_PLATFORM_FEE_BPS; delete process.env.CONNECT_APP_FEE_BPS; });
  afterEach(() => { process.env = { ...OLD }; });

  it('defaults to 0 (no fee) at launch — 8% is NOT assumed', () => {
    expect(getBreederPlatformFeeBps()).toBe(0);
  });
  it('uses the dedicated BREEDER_PLATFORM_FEE_BPS when set, clamped to 100%', () => {
    process.env.BREEDER_PLATFORM_FEE_BPS = '800';
    expect(getBreederPlatformFeeBps()).toBe(800);
    process.env.BREEDER_PLATFORM_FEE_BPS = '999999';
    expect(getBreederPlatformFeeBps()).toBe(10000);
  });
  it('falls back to CONNECT_APP_FEE_BPS when the breeder knob is unset', () => {
    process.env.CONNECT_APP_FEE_BPS = '500';
    expect(getBreederPlatformFeeBps()).toBe(500);
  });
  it('the deal fee is derived from the breeder knob, server-side (0% for rehoming/shelter)', () => {
    expect(deals).toMatch(/getBreederPlatformFeeBps\(\)/);
    expect(deals).toMatch(/platformFeeCents = commissionExempt \? 0 : Math\.round\(totalCents \* \(PLATFORM_FEE_BPS \/ 10000\)\)/);
  });
});

// ─────────────── listing / seller identity + authoritative price ───────────────
describe('seller + price derive from the listing, never the client', () => {
  it('seller is the listing owner; price is the DB listing price; no client amount', () => {
    expect(deals).toMatch(/totalCents = Math\.round\(parseFloat\(listing\.price\) \* 100\)/);
    expect(deals).toMatch(/seller_id/); // deal seller from listing.user_id
    expect(deals).not.toMatch(/req\.body[^;]*amount/);
    expect(deals).not.toMatch(/req\.body[^;]*destination/);
  });
  it('a seller cannot buy their own listing; duplicate active deals are blocked', () => {
    expect(deals).toMatch(/listing\.user_id === userId/);
    expect(deals).toMatch(/Listing already has an active deal/);
  });
});

// ─────────────── P0: release authentication + double-payout race ───────────────
describe('protected release is authenticated, atomic, and idempotent', () => {
  it('release now requires authentication (was anonymous)', () => {
    const rel = deals.slice(deals.indexOf('router.post("/:dealId/release"'));
    expect(rel.slice(0, 400)).toMatch(/const userId = req\.user\?\.id;\s*\n\s*if \(!userId\) return res\.status\(401\)/);
  });
  it('release is admin OR the auto-release-after-window condition — nobody else', () => {
    expect(deals).toMatch(/isAutoRelease =\s*[\s\S]*DELIVERED_CONFIRMED/);
    expect(deals).toMatch(/if \(!isAdmin && !isAutoRelease\)/);
  });
  it('an atomic status claim + Stripe idempotency key prevent double payout', () => {
    expect(deals).toMatch(/UPDATE deals SET status = 'RELEASING'[\s\S]*status NOT IN \('RELEASED','RELEASING','REFUNDED','DISPUTED','CANCELED'\)[\s\S]*RETURNING id/);
    expect(deals).toMatch(/idempotencyKey: `deal_release_\$\{deal\.id\}`/);
  });
  it('a failed transfer never marks the deal released (reverts the claim)', () => {
    expect(deals).toMatch(/status = \$2[\s\S]*WHERE id = \$1 AND status = 'RELEASING'/);
    expect(deals).toMatch(/INSERT INTO deal_payouts[\s\S]*'failed'\)/); // failed payout recorded, not released
  });
});

// ─────────────── authoritative seller Connect account ───────────────
describe('seller payout account is the authoritative Connect field, verified', () => {
  it('reads providers.stripe_account_id (authoritative), falling back to profiles', () => {
    expect(deals).toMatch(/pr\.stripe_account_id AS pr_account, p\.stripe_account_id AS p_account/);
    expect(deals).toMatch(/accountId: r\.pr_account \?\? r\.p_account/);
  });
  it('refuses to pay a seller with no account or payouts disabled', () => {
    expect(deals).toMatch(/Seller has no connected payout account/);
    expect(deals).toMatch(/Seller account is not enabled for payouts/);
  });
});

// ─────────────── refund + dispute safety ───────────────
describe('refund and dispute cannot move money unsafely', () => {
  it('refund is admin-only and fails SAFE once funds are released (manual reversal)', () => {
    const ref = deals.slice(deals.indexOf('router.post("/:dealId/refund"'));
    expect(ref.slice(0, 300)).toMatch(/isAdmin[\s\S]*return res\.status\(403\)/);
    expect(deals).toMatch(/Funds already released to seller; a transfer reversal must be handled manually/);
    expect(deals).toMatch(/idempotencyKey: `deal_refund_\$\{payment\.id\}`/);
  });
  it('a disputed deal cannot be released; only an admin resolves a dispute', () => {
    expect(deals).toMatch(/if \(deal\.status === "DISPUTED"\) return res\.status\(400\)/);
    const resolve = deals.slice(deals.indexOf('router.post("/:dealId/resolve"'));
    expect(resolve.slice(0, 200)).toMatch(/isAdmin[\s\S]*return res\.status\(403\)/);
  });
  it('resolve actually moves money (no status-only stub)', () => {
    expect(deals).toMatch(/action === "release"[\s\S]*releaseDealFunds/);
    expect(deals).toMatch(/action === "refund"[\s\S]*refundDeal\(deal, "all"\)/);
    expect(deals).not.toMatch(/const fakeReq =/); // the old stub is gone
  });
});

// ─────────────── legacy escrow bypasses closed ───────────────
describe('dangerous legacy escrow edge functions are neutralized', () => {
  const fns = [
    'stripe-payment', 'create-escrow-payment', 'create-escrow-transaction',
    'confirm-escrow-transaction', 'release-escrow-funds', 'create-escrow-dispute',
    'resolve-escrow-dispute', 'process-refund',
  ];
  it('each returns 410 ESCROW_ENDPOINT_RETIRED and performs no Stripe/DB action', () => {
    for (const fn of fns) {
      const src = read(`supabase/functions/${fn}/index.ts`);
      expect(src).toMatch(/ESCROW_ENDPOINT_RETIRED/);
      expect(src).toMatch(/status: 410/);
      expect(src).not.toMatch(/stripe\.(paymentIntents|transfers|refunds)\.|\.capture\(/);
      expect(src).not.toMatch(/Function stub — deploy full implementation/); // fake-success stub gone
    }
  });
});

// ─────────────── terminology ───────────────
describe('routed public copy no longer claims an escrow service', () => {
  it('help/guide copy uses protected-payment language, not "escrow system/payment"', () => {
    for (const f of [
      'client/src/data/helpData.ts',
      'client/src/pages/help/BuyingGuide.tsx',
      'client/src/pages/help/SellingBreeding.tsx',
      'client/src/pages/help/SafetyTrust.tsx',
    ]) {
      const src = read(f);
      expect(src).not.toMatch(/escrow system|escrow payment/i);
      expect(src).toMatch(/protected-payment/);
    }
  });
});
