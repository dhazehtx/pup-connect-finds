import { v5 as uuidv5 } from 'uuid';

/**
 * Namespace UUID — deterministic Pup Box product rows in DB (`products.id` is uuid in Postgres).
 */
const PUPBOX_PRODUCT_NAMESPACE = 'c9b3f2a1-7d4e-5c6b-9a8f-1e2d3c4b5a6f';

/** Normalize cart line ids from JSON (handles odd whitespace / unicode). */
export function normalizeCartLineId(raw: unknown): string {
  const s = typeof raw === 'string' ? raw : String(raw ?? '');
  return s.normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
}

/**
 * Pup Box "Add to cart" uses synthetic IDs like `pupbox-medium-subscription`.
 * Store catalog uses DB product UUIDs. Checkout maps slugs → stable UUIDs for inserts/FKs.
 * Keys must match `PupBoxSubscription.tsx` (`pupbox-${planId}-${subscription|oneTime}`).
 */
export function pupBoxCartSlugToProductUuid(slug: string): string {
  return uuidv5(slug, PUPBOX_PRODUCT_NAMESPACE);
}
export const PUPBOX_CART_IDS: Record<
  string,
  { name: string; unit_price: string; is_subscription: boolean }
> = {
  'pupbox-small-subscription': {
    name: 'Small Pup Box (Subscription)',
    unit_price: '19.99',
    is_subscription: true,
  },
  'pupbox-small-oneTime': {
    name: 'Small Pup Box (One-Time)',
    unit_price: '23.99',
    is_subscription: false,
  },
  'pupbox-medium-subscription': {
    name: 'Medium Pup Box (Subscription)',
    unit_price: '29.99',
    is_subscription: true,
  },
  'pupbox-medium-oneTime': {
    name: 'Medium Pup Box (One-Time)',
    unit_price: '35.99',
    is_subscription: false,
  },
  'pupbox-large-subscription': {
    name: 'Large Pup Box (Subscription)',
    unit_price: '39.99',
    is_subscription: true,
  },
  'pupbox-large-oneTime': {
    name: 'Large Pup Box (One-Time)',
    unit_price: '47.99',
    is_subscription: false,
  },
};

/**
 * Normalize client cart ids: trim, fix casing (`onetime` → `oneTime`), so lookups match
 * `PupBoxSubscription.tsx` (`pupbox-${plan}-${subscription|oneTime}`).
 */
export function canonicalPupBoxCartId(raw: string): string | null {
  const s = normalizeCartLineId(raw);
  const m = /^pupbox-(small|medium|large)-(subscription|oneTime|onetime)$/i.exec(s);
  if (!m) return null;
  const plan = m[1].toLowerCase();
  const tail = m[2].toLowerCase();
  const billing = tail === "onetime" ? "oneTime" : "subscription";
  return `pupbox-${plan}-${billing}`;
}

export function getPupBoxStub(id: string) {
  const t = id.trim();
  const c = canonicalPupBoxCartId(t);
  if (c && PUPBOX_CART_IDS[c]) return PUPBOX_CART_IDS[c];
  return PUPBOX_CART_IDS[t] ?? null;
}
