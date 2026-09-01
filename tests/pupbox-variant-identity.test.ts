/**
 * Pup Box data-model repair — variant-scoped SKU identity.
 *
 * Root cause: products.id is the checkout's purchasable-SKU identity, but Pup Box
 * rows derived it from stripeProductId alone, so monthly + one-time variants
 * sharing a Stripe Product collided into ONE row (3 rows for 6 variants; Monthly
 * mispriced as one-time). The fix derives the id from (stripeProductId +
 * stripePriceId) for Pup Box only. These tests run the REAL helpers/parser with
 * the authoritative Stripe TEST catalog and pin the sync/plans wiring plus the
 * certified Store path staying untouched.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  dbProductIdFromStripeProductId,
  dbProductIdForPupboxVariant,
} from '../server/lib/storeProductId';
import { parsePupboxCatalogFromEnv } from '../server/lib/pupboxCatalog';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');

// Authoritative Stripe TEST catalog: 3 Products, 2 Prices each.
const CATALOG = [
  { key: 'small_subscription',  stripeProductId: 'prod_VB1Pvd8hFL6Y61', stripePriceId: 'price_1UAfMtAECpn9W1U9yqHHs3nr', amount: '19.99', recurring: true,  name: 'Small Pup Box Monthly' },
  { key: 'small_one_time',      stripeProductId: 'prod_VB1Pvd8hFL6Y61', stripePriceId: 'price_1UAfdwAECpn9W1U9hItRf9HH', amount: '23.99', recurring: false, name: 'Small Pup Box One-Time' },
  { key: 'medium_subscription', stripeProductId: 'prod_VB1W8X4Ra9zTKV', stripePriceId: 'price_1UAfT7AECpn9W1U9pxwTV6dR', amount: '29.99', recurring: true,  name: 'Medium Pup Box Monthly' },
  { key: 'medium_one_time',     stripeProductId: 'prod_VB1W8X4Ra9zTKV', stripePriceId: 'price_1UAfeCAECpn9W1U9mw73CiiA', amount: '35.99', recurring: false, name: 'Medium Pup Box One-Time' },
  { key: 'large_subscription',  stripeProductId: 'prod_VB1XHk5PhJthP9', stripePriceId: 'price_1UAfUVAECpn9W1U9slGVunae', amount: '39.99', recurring: true,  name: 'Large Pup Box Monthly' },
  { key: 'large_one_time',      stripeProductId: 'prod_VB1XHk5PhJthP9', stripePriceId: 'price_1UAferAECpn9W1U9o7j9uMjb', amount: '47.99', recurring: false, name: 'Large Pup Box One-Time' },
];

describe('variant identity: 3 Products + 6 Prices → 6 distinct PAWS rows', () => {
  const ids = CATALOG.map((e) => dbProductIdForPupboxVariant(e.stripeProductId, e.stripePriceId));

  it('produces 6 distinct row ids (no collisions)', () => {
    expect(new Set(ids).size).toBe(6);
  });
  it.each([['small', 0, 1], ['medium', 2, 3], ['large', 4, 5]] as const)(
    '%s subscription and one_time have DIFFERENT row ids',
    (_size, a, b) => {
      expect(ids[a]).not.toBe(ids[b]);
    },
  );
  it('is deterministic/stable across calls (idempotent sync, stable across redeploys)', () => {
    for (const e of CATALOG) {
      expect(dbProductIdForPupboxVariant(e.stripeProductId, e.stripePriceId)).toBe(
        dbProductIdForPupboxVariant(` ${e.stripeProductId} `, ` ${e.stripePriceId} `),
      );
    }
  });
  it('every variant id differs from the legacy product-only id (self-heal can never deactivate a new row)', () => {
    for (const e of CATALOG) {
      expect(dbProductIdForPupboxVariant(e.stripeProductId, e.stripePriceId)).not.toBe(
        dbProductIdFromStripeProductId(e.stripeProductId),
      );
    }
  });
});

describe('parsed catalog → per-variant billing/price/amount resolution', () => {
  const OLD = { ...process.env };
  beforeEach(() => {
    process.env.PUPBOX_CATALOG_JSON = JSON.stringify(CATALOG);
  });
  afterEach(() => {
    process.env = { ...OLD };
  });

  it('the app parser yields all six variants intact', () => {
    const entries = parsePupboxCatalogFromEnv();
    expect(entries).toHaveLength(6);
    const byKey = new Map(entries.map((e) => [e.key, e]));
    // subscription variants: recurring=true, monthly price + amount
    expect(byKey.get('small_subscription')).toMatchObject({ recurring: true, stripePriceId: 'price_1UAfMtAECpn9W1U9yqHHs3nr', amount: '19.99' });
    expect(byKey.get('medium_subscription')).toMatchObject({ recurring: true, stripePriceId: 'price_1UAfT7AECpn9W1U9pxwTV6dR', amount: '29.99' });
    expect(byKey.get('large_subscription')).toMatchObject({ recurring: true, stripePriceId: 'price_1UAfUVAECpn9W1U9slGVunae', amount: '39.99' });
    // one-time variants: recurring=false, one-time price + amount
    expect(byKey.get('small_one_time')).toMatchObject({ recurring: false, stripePriceId: 'price_1UAfdwAECpn9W1U9hItRf9HH', amount: '23.99' });
    expect(byKey.get('medium_one_time')).toMatchObject({ recurring: false, stripePriceId: 'price_1UAfeCAECpn9W1U9mw73CiiA', amount: '35.99' });
    expect(byKey.get('large_one_time')).toMatchObject({ recurring: false, stripePriceId: 'price_1UAferAECpn9W1U9o7j9uMjb', amount: '47.99' });
  });

  it('cart resolution: each key maps to a UNIQUE row carrying its own billing/price/amount', () => {
    // The cart buys plans[].id; the server derives billing + Stripe Price + amount
    // from that row. With variant ids, Small Monthly can only resolve to the
    // $19.99 recurring row and Small One-Time to the $23.99 one-time row (and
    // likewise for Medium/Large) — the collision that mispriced Monthly is gone.
    const entries = parsePupboxCatalogFromEnv();
    const rowByVariantId = new Map(
      entries.map((e) => [dbProductIdForPupboxVariant(e.stripeProductId, e.stripePriceId), e]),
    );
    expect(rowByVariantId.size).toBe(6);
    for (const e of entries) {
      const row = rowByVariantId.get(dbProductIdForPupboxVariant(e.stripeProductId, e.stripePriceId))!;
      expect(row.key).toBe(e.key);
      expect(row.amount).toBe(e.amount);
      expect(row.recurring).toBe(e.recurring);
      expect(row.stripePriceId).toBe(e.stripePriceId);
    }
  });
});

describe('wiring pins: plans endpoint + sync use the variant id; Store path unchanged', () => {
  const pupbox = read('server/routes/pupbox.ts');
  const sync = read('scripts/sync-store-catalog-from-csv.ts');

  it('/api/pupbox/plans derives ids via dbProductIdForPupboxVariant', () => {
    expect(pupbox).toMatch(/dbProductIdForPupboxVariant\(e\.stripeProductId, e\.stripePriceId\)/);
    expect(pupbox).not.toMatch(/dbProductIdFromStripeProductId/);
  });
  it('sync upserts Pup Box rows via the variant id and self-heals legacy collided rows (tag-guarded)', () => {
    expect(sync).toMatch(/const rowId = dbProductIdForPupboxVariant\(e\.stripeProductId, e\.stripePriceId\)/);
    expect(sync).toMatch(/tags @> ARRAY\['pup-box'\]/); // deactivation can only touch pup-box rows
    expect(sync).toMatch(/is_active = false/);
  });
  it('Store CSV rows STILL use the certified product-only derivation (unchanged)', () => {
    expect(sync).toMatch(/const rowId = dbProductIdFromStripeProductId\(stripeProductId\)/);
  });
  it('client cannot substitute price or amount: checkout stays server-authoritative', () => {
    const checkout = read('server/routes/checkout.ts');
    // amount from the DB row, subscription price id from the DB row — never req.body
    expect(checkout).toMatch(/parseFloat\(product\.unit_price\)/);
    expect(checkout).toMatch(/product\.stripe_price_id/);
    expect(checkout).not.toMatch(/req\.body[^;]*(amount|stripe_price_id|price_id)/);
    // the Pup Box client sends no price authority either
    const client = read('client/src/components/subscriptions/PupBoxSubscription.tsx');
    expect(client).toMatch(/stripe_price_id: undefined/);
  });
});
