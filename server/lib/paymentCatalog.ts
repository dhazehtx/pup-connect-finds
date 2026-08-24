/**
 * Server-authoritative price catalog for one-time PaymentIntents.
 *
 * The client must never dictate how much it is charged. Endpoints that create a
 * one-time PaymentIntent resolve the amount here, keyed by a known `productType`.
 * Prices are configurable via env so the owner sets real values without a code
 * change; an unknown or unconfigured product resolves to `null` and the caller
 * must reject the request (fail closed) rather than trust a client amount.
 */

function envCents(name: string): number | null {
  const raw = process.env[name];
  if (!raw) return null;
  const n = Number.parseInt(raw.trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Maps a productType to its price in cents. Extend this map (and the env keys)
 * as new one-time products are added. Returns null when the product is unknown
 * or its price is not configured on the server.
 */
export function resolveOneTimeAmountCents(productType: unknown): number | null {
  if (typeof productType !== 'string' || !productType.trim()) return null;

  switch (productType) {
    case 'rehoming_feature':
      // e.g. REHOMING_FEATURE_PRICE_CENTS=2999
      return envCents('REHOMING_FEATURE_PRICE_CENTS');
    case 'pup_box':
      // e.g. PUP_BOX_PRICE_CENTS=2399
      return envCents('PUP_BOX_PRICE_CENTS');
    case 'listing_boost':
      return envCents('LISTING_BOOST_PRICE_CENTS');
    default:
      return null;
  }
}

/** True if the server has a configured price for this product type. */
export function isKnownOneTimeProduct(productType: unknown): boolean {
  return resolveOneTimeAmountCents(productType) !== null;
}
