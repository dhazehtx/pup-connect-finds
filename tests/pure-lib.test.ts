/**
 * Deterministic unit tests for pure launch-critical libs (no DB/Stripe/network):
 *  - platform fee resolution (revenue math; env-driven, default 0)
 *  - Pup Box cart id normalization + deterministic slug→uuid mapping + catalog
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('platformFees — env-driven, fail-safe to 0', () => {
  const OLD = { ...process.env };
  beforeEach(() => { delete process.env.PLATFORM_FEE_PERCENT; delete process.env.CONNECT_APP_FEE_BPS; });
  afterEach(() => { process.env = { ...OLD }; });

  it('getPlatformFeePercent defaults to 0 and parses a valid decimal', async () => {
    const { getPlatformFeePercent } = await import('../server/lib/platformFees');
    expect(getPlatformFeePercent()).toBe(0);
    process.env.PLATFORM_FEE_PERCENT = '0.10';
    expect(getPlatformFeePercent()).toBeCloseTo(0.10);
  });

  it('getPlatformFeePercent rejects negative / non-numeric → 0 (never charges a negative fee)', async () => {
    const { getPlatformFeePercent } = await import('../server/lib/platformFees');
    process.env.PLATFORM_FEE_PERCENT = '-0.5';
    expect(getPlatformFeePercent()).toBe(0);
    process.env.PLATFORM_FEE_PERCENT = 'abc';
    expect(getPlatformFeePercent()).toBe(0);
    process.env.PLATFORM_FEE_PERCENT = '';
    expect(getPlatformFeePercent()).toBe(0);
  });

  it('getConnectAppFeeBps defaults to 0, parses ints, rejects negatives', async () => {
    const { getConnectAppFeeBps } = await import('../server/lib/platformFees');
    expect(getConnectAppFeeBps()).toBe(0);
    process.env.CONNECT_APP_FEE_BPS = '1000';
    expect(getConnectAppFeeBps()).toBe(1000);
    process.env.CONNECT_APP_FEE_BPS = '-5';
    expect(getConnectAppFeeBps()).toBe(0);
    process.env.CONNECT_APP_FEE_BPS = 'x';
    expect(getConnectAppFeeBps()).toBe(0);
  });
});

describe('pupBoxCart — id normalization, catalog, deterministic uuid', () => {
  it('normalizeCartLineId trims and strips zero-width chars', async () => {
    const { normalizeCartLineId } = await import('../server/lib/pupBoxCart');
    expect(normalizeCartLineId('  pupbox-small-oneTime  ')).toBe('pupbox-small-oneTime');
    expect(normalizeCartLineId('pupbox-small-oneTime​')).toBe('pupbox-small-oneTime');
    expect(normalizeCartLineId(null)).toBe('');
  });

  it('canonicalPupBoxCartId normalizes billing casing and rejects unknown ids', async () => {
    const { canonicalPupBoxCartId } = await import('../server/lib/pupBoxCart');
    expect(canonicalPupBoxCartId('pupbox-medium-onetime')).toBe('pupbox-medium-oneTime');
    expect(canonicalPupBoxCartId('pupbox-large-subscription')).toBe('pupbox-large-subscription');
    expect(canonicalPupBoxCartId('  PUPBOX-SMALL-ONETIME ')).toBe('pupbox-small-oneTime');
    expect(canonicalPupBoxCartId('pupbox-gigantic-oneTime')).toBeNull();
    expect(canonicalPupBoxCartId('not-a-pupbox')).toBeNull();
  });

  it('PUPBOX_CART_IDS catalog has stable prices + subscription flags', async () => {
    const { PUPBOX_CART_IDS } = await import('../server/lib/pupBoxCart');
    expect(PUPBOX_CART_IDS['pupbox-small-subscription']).toMatchObject({ unit_price: '19.99', is_subscription: true });
    expect(PUPBOX_CART_IDS['pupbox-medium-oneTime']).toMatchObject({ unit_price: '35.99', is_subscription: false });
    expect(Object.keys(PUPBOX_CART_IDS)).toHaveLength(6);
  });

  it('pupBoxCartSlugToProductUuid is deterministic + a valid uuid', async () => {
    const { pupBoxCartSlugToProductUuid } = await import('../server/lib/pupBoxCart');
    const a = pupBoxCartSlugToProductUuid('pupbox-medium-subscription');
    const b = pupBoxCartSlugToProductUuid('pupbox-medium-subscription');
    const c = pupBoxCartSlugToProductUuid('pupbox-large-subscription');
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});
