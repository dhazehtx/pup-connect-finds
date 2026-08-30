/**
 * Payment Sprint 1 — Store + shared Stripe foundation.
 *
 * Behavioural tests for the pure pieces (refund-status decision, fatal
 * TEST/LIVE guard) and source-level regression guards for the wiring the
 * Neon-serverless driver prevents us from exercising over local HTTP+DB
 * (catalog authz, one canonical DB-idempotent webhook, quantity/inventory).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { computeRefundedOrderStatus } from '../server/lib/stripe-handlers';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');

// ─────────────── 1. Catalog / product mutations are admin-gated ───────────────
describe('catalog writes require admin (price integrity)', () => {
  const products = read('server/routes/products.ts');
  it('product create + stripe sync are behind requireAdmin, not soft authMiddleware', () => {
    expect(products).toMatch(/router\.post\("\/",\s*requireAuth,\s*requireAdmin/);
    expect(products).toMatch(/router\.post\("\/sync-stripe",\s*requireAuth,\s*requireAdmin/);
    // the soft, never-rejecting authMiddleware must no longer guard mutations
    expect(products).not.toMatch(/authMiddleware/);
    expect(products).toMatch(/import \{ requireAuth, requireAdmin \}/);
  });
  it('the legacy per-product checkout at least requires authentication', () => {
    expect(products).toMatch(/router\.post\("\/:id\/checkout",\s*requireAuth/);
  });
});

// ─────────────── 2. ONE authoritative, DB-idempotent webhook path ───────────────
describe('unified Stripe webhook architecture', () => {
  const routes = read('server/routes.ts');
  const canonical = read('server/routes/stripe/webhook.ts');
  it('documented /api/webhooks/stripe + its alias delegate to the canonical router', () => {
    expect(routes).toMatch(/app\.use\("\/api\/webhooks\/stripe",\s*stripeWebhookRouter\)/);
    expect(routes).toMatch(/app\.use\("\/api\/payments\/webhook",\s*stripeWebhookRouter\)/);
    expect(routes).toMatch(/app\.use\('\/api\/stripe\/webhook',\s*stripeWebhookRouter\)/);
  });
  it('the old in-memory idempotency handler is gone (no competing handler)', () => {
    expect(routes).not.toMatch(/processedWebhookEvents/);
    expect(routes).not.toMatch(/const stripeWebhookHandler/);
  });
  it('the canonical router verifies signatures, fails closed, and dedupes in the DB', () => {
    expect(canonical).toMatch(/constructEvent\(body, sig, STRIPE_WEBHOOK_SECRET\)/);
    expect(canonical).toMatch(/IS_PROD\) return res\.status\(503\)/); // fail closed w/o secret
    expect(canonical).toMatch(/return res\.status\(400\)/); // bad signature
    expect(canonical).toMatch(/withDbIdempotency\(event\.id/); // DB-backed dedupe
  });
  it('the DB idempotency helper is a unique-insert + duplicate-skip + retry-cleanup', () => {
    const idem = read('server/lib/idempotency.ts');
    expect(idem).toMatch(/INSERT INTO stripe_idempotency/);
    expect(idem).toMatch(/23505/); // duplicate key => skip
    expect(idem).toMatch(/DELETE FROM stripe_idempotency/); // cleanup so a retry re-processes
  });
});

// ─────────────── 3. Store authoritative price preserved ───────────────
describe('store checkout keeps server-authoritative pricing', () => {
  const checkout = read('server/routes/checkout.ts');
  it('unit price is derived from the DB product, never the request body', () => {
    expect(checkout).toMatch(/parseFloat\(product\.unit_price\)/);
    expect(checkout).not.toMatch(/req\.body[^;]*amount/);
  });
});

// ─────────────── 4. Refund → order synchronization ───────────────
describe('computeRefundedOrderStatus (refund state, no faked partial amount)', () => {
  it('full refund → refunded', () => {
    expect(computeRefundedOrderStatus(5000, 5000)).toBe('refunded');
    expect(computeRefundedOrderStatus(5000, 6000)).toBe('refunded'); // over-refund still full
  });
  it('partial refund → partially_refunded', () => {
    expect(computeRefundedOrderStatus(5000, 1500)).toBe('partially_refunded');
  });
  it('no/invalid refund or total → null (leave order untouched)', () => {
    expect(computeRefundedOrderStatus(5000, 0)).toBeNull();
    expect(computeRefundedOrderStatus(5000, -1)).toBeNull();
    expect(computeRefundedOrderStatus(0, 100)).toBeNull();
    expect(computeRefundedOrderStatus(NaN, 100)).toBeNull();
  });
});

describe('refund handler syncs the OWNING order safely', () => {
  const h = read('server/lib/stripe-handlers.ts');
  it('matches the order strictly by payment intent (never another order)', () => {
    expect(h).toMatch(/WHERE payment_intent_id = \$1 OR stripe_payment_intent_id = \$1/);
  });
  it('uses cumulative amount_refunded for charge.refunded (full vs partial)', () => {
    expect(h).toMatch(/charge\.amount_refunded/);
  });
  it('is idempotent: only transitions from paid/partially_refunded and guards status change', () => {
    expect(h).toMatch(/status === 'paid' \|\| order\.status === 'partially_refunded'/);
    expect(h).toMatch(/AND status <> \$1/);
    expect(h).toMatch(/computeRefundedOrderStatus/);
  });
});

// ─────────────── 5. Quantity + inventory safety ───────────────
describe('store quantity + inventory integrity', () => {
  it('checkout rejects non-integer/zero/negative/oversized quantities', () => {
    const checkout = read('server/routes/checkout.ts');
    expect(checkout).toMatch(/Number\.isInteger\(item\.quantity\)/);
    expect(checkout).toMatch(/MAX_QTY_PER_ITEM/);
  });
  it('inventory decrement is floored at zero (no negative stock)', () => {
    const storage = read('server/storage.ts');
    expect(storage).toMatch(/GREATEST\(\$\{products\.inventory_qty\} - \$\{quantity\}, 0\)/);
  });
  it('fulfillment stays decrement-once (pending-guarded, idempotent)', () => {
    const wh = read('server/lib/checkoutSessionWebhook.ts');
    expect(wh).toMatch(/status === ["']pending["']/);
  });
});

// ─────────────── 6. TEST/LIVE isolation — fatal guard fails closed safely ───────────────
describe('validateStripeKeyModeFatal — fails closed on danger, not on intended TEST', () => {
  const OLD = { ...process.env };
  beforeEach(() => vi.resetModules());
  afterEach(() => { process.env = { ...OLD }; });

  async function loadWith(env: Record<string, string | undefined>) {
    for (const [k, v] of Object.entries(env)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    return import('../server/lib/config');
  }

  it('FATAL: a LIVE secret key while test mode is resolved', async () => {
    const { validateStripeKeyModeFatal } = await loadWith({
      STRIPE_MODE: 'test', STRIPE_SECRET_KEY: 'sk_live_abc',
    });
    expect(validateStripeKeyModeFatal().length).toBeGreaterThan(0);
  });

  it('NOT FATAL: a TEST key while production mode is resolved (intended pre-launch posture)', async () => {
    const { validateStripeKeyModeFatal, IS_PROD } = await loadWith({
      STRIPE_MODE: undefined, NODE_ENV: 'production',
      STRIPE_SECRET_KEY: 'sk_test_abc',
      STRIPE_SECRET_KEY_LIVE: undefined, STRIPE_SECRET_KEY_TEST: undefined,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE: undefined,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST: undefined,
      VITE_STRIPE_PUBLIC_KEY: undefined,
    });
    expect(IS_PROD).toBe(true);
    expect(validateStripeKeyModeFatal()).toEqual([]); // must NOT block boot — prod stays TEST
  });

  it('FATAL: mixed-mode publishable/secret keys', async () => {
    const { validateStripeKeyModeFatal } = await loadWith({
      STRIPE_MODE: 'live', STRIPE_SECRET_KEY: 'sk_live_abc',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE: 'pk_test_abc',
    });
    expect(validateStripeKeyModeFatal().length).toBeGreaterThan(0);
  });

  it('NOT FATAL: a clean live configuration', async () => {
    const { validateStripeKeyModeFatal } = await loadWith({
      STRIPE_MODE: 'live', STRIPE_SECRET_KEY: 'sk_live_abc',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE: 'pk_live_abc',
    });
    expect(validateStripeKeyModeFatal()).toEqual([]);
  });

  it('boot fails closed on a fatal mismatch', () => {
    const index = read('server/index.ts');
    expect(index).toMatch(/validateStripeKeyModeFatal\(\)/);
    expect(index).toMatch(/process\.exit\(1\)/);
  });

  it('payment code resolves keys through the config resolver, not process.env directly', () => {
    for (const f of [
      'server/stripe/createCheckoutSession.ts',
      'server/utils/stripeSync.ts',
      'server/services/refundService.ts',
    ]) {
      const src = read(f);
      expect(src).toMatch(/STRIPE_SECRET_KEY.*from ['"]\.\.\/lib\/config['"]/s);
      expect(src).not.toMatch(/new Stripe\(process\.env\.STRIPE_SECRET_KEY/);
    }
  });
});
