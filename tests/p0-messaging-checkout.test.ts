/**
 * P0 beta-blocker regressions — messaging + authenticated Stripe TEST checkout.
 *
 * These guard the exact defects the authenticated production E2E found:
 *
 *  MESSAGING — schema drift. Production `messages` stores read state as a nullable
 *  timestamp `read_at`, but the Drizzle schema/code referenced a boolean `read`
 *  column that does not exist in prod. That threw inside the unread-count query
 *  (masked to an empty inbox) and 500'd message loading. Guard: the schema uses
 *  read_at, and storage.ts never references `messages.read`.
 *
 *  CHECKOUT AUTH — the three client checkout call sites used a raw fetch with
 *  `credentials: 'include'` but NO Authorization header. The Express authMiddleware
 *  authenticates only via the Bearer token, so checkout 401'd while cookie-less
 *  Bearer routes (notifications) worked. Guard: every checkout fetch spreads in
 *  authHeaders().
 *
 *  CHECKOUT STRIPE SESSION — store products carry LIVE-mode stripe_price_id values,
 *  unusable by a TEST-mode key ("No such price … exists in live mode"). Guard: the
 *  route builds an inline price_data for one-time items instead of using the stored
 *  price id, and surfaces a typed error instead of a bare 500.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');

describe('Messaging — messages read-state schema matches production (read_at, not read)', () => {
  const schema = read('shared/schema.ts');
  const storage = read('server/storage.ts');

  it('the Drizzle messages table declares read_at (timestamp), not a boolean read', () => {
    const block = schema.slice(
      schema.indexOf('export const messages = pgTable'),
      schema.indexOf('});', schema.indexOf('export const messages = pgTable')),
    );
    expect(block).toMatch(/read_at:\s*timestamp\("read_at"\)/);
    expect(block).not.toMatch(/\bread:\s*boolean\("read"\)/);
  });

  it('storage.ts never references the nonexistent messages.read column', () => {
    expect(storage).not.toMatch(/messages\.read\b(?!_at)/);
  });

  it('storage.ts expresses unread via isNull(messages.read_at) and marks read via read_at', () => {
    expect(storage).toMatch(/isNull\(messages\.read_at\)/);
    expect(storage).toMatch(/\.set\(\{\s*read_at:\s*new Date\(\)\s*\}\)/);
    // isNull must be imported for the above to compile/run
    expect(storage).toMatch(/import\s*\{[^}]*\bisNull\b[^}]*\}\s*from\s*["']drizzle-orm["']/);
  });
});

describe('Listing age — displayed unit is weeks and consistent with the detail page', () => {
  // The stored dog_listings.age is in WEEKS (create form: "Age (weeks) *"); the
  // detail page renders "<n> weeks old". Explore + card components previously
  // mislabeled the same value as "months" (a 4× age misstatement).
  const cards = [
    'client/src/components/explore/ListingCard.tsx',
    'client/src/components/ListingCard.tsx',
    'client/src/components/marketplace/ListingCard.tsx',
    'client/src/components/ListingsGrid.tsx',
    'client/src/components/listings/MobileListingCard.tsx',
    'client/src/components/search/SearchResultsGrid.tsx',
    'client/src/components/comparison/ListingsComparison.tsx',
    'client/src/pages/MyListingsPage.tsx',
  ];

  it('the routed detail page renders age in weeks (canonical)', () => {
    expect(read('client/src/pages/ListingDetail.tsx')).toMatch(/\$\{listing\.age\}\s*weeks old|listing\.age.*weeks/);
  });

  for (const f of cards) {
    it(`${path.basename(f)} does not render listing age as months`, () => {
      const src = read(f);
      // any occurrence of `.age` on the same line as the word "month" is the bug
      const offending = src
        .split('\n')
        .filter((l) => /\.age\b/.test(l) && /month/i.test(l) && !/age_months|ageRange/.test(l));
      expect(offending, `mislabeled age in ${f}: ${offending.join(' | ')}`).toEqual([]);
    });
  }
});

describe('Checkout — client attaches the Supabase Bearer token', () => {
  const files = [
    'client/src/pages/Cart.tsx',
    'client/src/pages/Marketplace/StoreTab.tsx',
    'client/src/components/BuyButton.tsx',
  ];

  it('api.ts exports an authHeaders() helper that returns a Bearer Authorization header', () => {
    const api = read('client/src/lib/api.ts');
    expect(api).toMatch(/export async function authHeaders\(\)/);
    expect(api).toMatch(/Authorization:\s*`Bearer \$\{token\}`/);
  });

  for (const f of files) {
    it(`${path.basename(f)} sends the checkout request with authHeaders()`, () => {
      const src = read(f);
      // the checkout fetch must merge the auth header in
      expect(src).toMatch(/fetch\('\/api\/checkout\/session'/);
      expect(src).toMatch(/\.\.\.\(await authHeaders\(\)\)/);
      expect(src).toMatch(/import\s*\{[^}]*\bauthHeaders\b[^}]*\}\s*from\s*['"]@\/lib\/api['"]/);
    });
  }
});

describe('Checkout — server builds a Stripe-mode-agnostic session for one-time items', () => {
  const route = read('server/routes/checkout.ts');

  it('one-time line items use inline price_data (not the stored live-mode price id)', () => {
    // The old `else if (product.stripe_price_id) { price: … }` shortcut for
    // one-time products is gone; only the subscription branch uses `price:`.
    expect(route).not.toMatch(/else if \(product\.stripe_price_id\)/);
    expect(route).toMatch(/price_data:\s*\{/);
    expect(route).toMatch(/unit_amount:\s*unitPriceCents/);
  });

  it('only attaches product images when they are absolute URLs (Stripe rejects relative paths)', () => {
    expect(route).toMatch(/\/\^https\?:\\\/\\\/\/i\.test\(product\.image_url\)/);
  });

  it('surfaces a typed error/code instead of only a bare "Failed to create checkout session"', () => {
    expect(route).toMatch(/STRIPE_PRICE_UNAVAILABLE/);
    expect(route).toMatch(/type:\s*error\?\.type/);
  });

  it('still requires authentication on the checkout route', () => {
    expect(route).toMatch(/router\.post\("\/session",\s*authMiddleware/);
    expect(route).toMatch(/return res\.status\(401\)\.json\(\{ error: "User not authenticated" \}\)/);
  });
});
