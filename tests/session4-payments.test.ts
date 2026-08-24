/**
 * Session 4 — Stripe / payments revenue-safety regression tests.
 *
 * Covers the pure, deterministic guarantees:
 *   - Stripe key/mode validation catches live/test mismatches and the mock key.
 *   - The one-time price catalog is server-authoritative (client amount ignored;
 *     unknown/unconfigured products resolve to null so the caller fails closed).
 * Env is set via vi.hoisted before importing the config module.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Session 4 — server-authoritative one-time price catalog', () => {
  const OLD = { ...process.env };
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    process.env = { ...OLD };
  });

  it('returns null for an unknown product (caller must fail closed)', async () => {
    const { resolveOneTimeAmountCents } = await import('../server/lib/paymentCatalog');
    expect(resolveOneTimeAmountCents('totally_unknown')).toBeNull();
    expect(resolveOneTimeAmountCents('')).toBeNull();
    expect(resolveOneTimeAmountCents(undefined)).toBeNull();
    expect(resolveOneTimeAmountCents(12345)).toBeNull();
  });

  it('returns null for a known product when its price is not configured', async () => {
    delete process.env.REHOMING_FEATURE_PRICE_CENTS;
    const { resolveOneTimeAmountCents } = await import('../server/lib/paymentCatalog');
    expect(resolveOneTimeAmountCents('rehoming_feature')).toBeNull();
  });

  it('resolves the configured server price, ignoring any client-supplied amount', async () => {
    process.env.REHOMING_FEATURE_PRICE_CENTS = '2999';
    const { resolveOneTimeAmountCents } = await import('../server/lib/paymentCatalog');
    // The function takes only productType — a client amount can never influence it.
    expect(resolveOneTimeAmountCents('rehoming_feature')).toBe(2999);
  });

  it('rejects a non-positive or malformed configured price', async () => {
    process.env.PUP_BOX_PRICE_CENTS = '-5';
    const { resolveOneTimeAmountCents } = await import('../server/lib/paymentCatalog');
    expect(resolveOneTimeAmountCents('pup_box')).toBeNull();
  });
});

describe('Session 4 — Stripe key/mode validation', () => {
  const OLD = { ...process.env };
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    process.env = { ...OLD };
  });

  async function loadConfigWith(env: Record<string, string | undefined>) {
    for (const [k, v] of Object.entries(env)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    return import('../server/lib/config');
  }

  it('flags a test secret key when production mode is resolved', async () => {
    const { validateStripeKeyMode, IS_PROD } = await loadConfigWith({
      STRIPE_MODE: 'live',
      STRIPE_SECRET_KEY: 'sk_test_abc',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE: 'pk_live_abc',
    });
    expect(IS_PROD).toBe(true);
    const problems = validateStripeKeyMode();
    expect(problems.join(' ')).toMatch(/TEST key/i);
  });

  it('flags a live/test publishable/secret mismatch', async () => {
    const { validateStripeKeyMode } = await loadConfigWith({
      STRIPE_MODE: 'live',
      STRIPE_SECRET_KEY: 'sk_live_abc',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE: 'pk_test_abc',
    });
    expect(validateStripeKeyMode().join(' ')).toMatch(/different modes/i);
  });

  it('flags the mock placeholder secret', async () => {
    const { validateStripeKeyMode } = await loadConfigWith({
      STRIPE_MODE: 'test',
      STRIPE_SECRET_KEY: 'sk_test_mock_key',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST: 'pk_test_abc',
    });
    expect(validateStripeKeyMode().join(' ')).toMatch(/mock placeholder/i);
  });

  it('passes for a clean live configuration', async () => {
    const { validateStripeKeyMode } = await loadConfigWith({
      STRIPE_MODE: 'live',
      STRIPE_SECRET_KEY: 'sk_live_abc',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE: 'pk_live_abc',
    });
    expect(validateStripeKeyMode()).toEqual([]);
  });

  it('resolves production mode from NODE_ENV=production (Railway/Render safe)', async () => {
    const { IS_PROD } = await loadConfigWith({
      STRIPE_MODE: undefined,
      NEXT_PUBLIC_APP_ENV: undefined,
      VERCEL_ENV: undefined,
      NODE_ENV: 'production',
    });
    expect(IS_PROD).toBe(true);
  });
});
