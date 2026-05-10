import { v5 as uuidv5 } from "uuid";

/** Must match scripts/sync-store-catalog-from-csv.ts — deterministic PK for products.id from Stripe product id. */
export const STRIPE_PRODUCT_NAMESPACE = "a1b2c3d4-e5f6-4789-a012-3456789abcde";

export function dbProductIdFromStripeProductId(stripeProductId: string): string {
  return uuidv5(stripeProductId.trim(), STRIPE_PRODUCT_NAMESPACE);
}
