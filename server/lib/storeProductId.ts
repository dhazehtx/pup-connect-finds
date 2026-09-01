import { v5 as uuidv5 } from "uuid";

/** Must match scripts/sync-store-catalog-from-csv.ts — deterministic PK for products.id from Stripe product id. */
export const STRIPE_PRODUCT_NAMESPACE = "a1b2c3d4-e5f6-4789-a012-3456789abcde";

export function dbProductIdFromStripeProductId(stripeProductId: string): string {
  return uuidv5(stripeProductId.trim(), STRIPE_PRODUCT_NAMESPACE);
}

/**
 * Deterministic PK for a PURCHASABLE VARIANT (SKU) that shares a Stripe Product
 * with sibling variants — e.g. Pup Box monthly vs one-time under one Product.
 *
 * products.id is the checkout's SKU identity (the server derives billing, Stripe
 * Price, and amount from the row), so two variants must never share a row.
 * Deriving from stripeProductId alone collided them (the second sync upsert
 * overwrote the first, leaving 3 rows for 6 variants and mispricing Monthly).
 * Compounding with the Stripe Price id is deterministic, collision-free (Price
 * ids are unique per variant), stable across redeploys, and idempotent for sync.
 *
 * Store CSV products keep dbProductIdFromStripeProductId (1 Price per Product —
 * certified behavior, unchanged).
 */
export function dbProductIdForPupboxVariant(stripeProductId: string, stripePriceId: string): string {
  return uuidv5(`${stripeProductId.trim()}:${stripePriceId.trim()}`, STRIPE_PRODUCT_NAMESPACE);
}
