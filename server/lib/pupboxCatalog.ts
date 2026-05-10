/**
 * Pup Box SKU list from env JSON. Upsert rows via npm run store:sync-catalog (extended) or keep in sync manually.
 *
 * Example PUPBOX_CATALOG_JSON:
 * [
 *   {"key":"small_subscription","stripeProductId":"prod_xxx","stripePriceId":"price_xxx","amount":"19.99","recurring":true,"name":"Small Pup Box Monthly"},
 *   {"key":"small_one_time","stripeProductId":"prod_yyy","stripePriceId":"price_yyy","amount":"23.99","recurring":false,"name":"Small Pup Box One-Time"}
 * ]
 */

export interface PupboxCatalogEntry {
  key: string;
  stripeProductId: string;
  stripePriceId: string;
  amount: string;
  currency?: string;
  recurring: boolean;
  name: string;
}

export function parsePupboxCatalogFromEnv(): PupboxCatalogEntry[] {
  const raw = process.env.PUPBOX_CATALOG_JSON?.trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    const out: PupboxCatalogEntry[] = [];
    for (const row of parsed) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      const key = typeof r.key === "string" ? r.key : "";
      const stripeProductId = typeof r.stripeProductId === "string" ? r.stripeProductId : "";
      const stripePriceId = typeof r.stripePriceId === "string" ? r.stripePriceId : "";
      const amount = typeof r.amount === "string" ? r.amount : String(r.amount ?? "");
      const recurring = Boolean(r.recurring);
      const name = typeof r.name === "string" ? r.name : "";
      const currency = typeof r.currency === "string" ? r.currency : undefined;
      if (!key || !stripeProductId || !stripePriceId || !amount || !name) continue;
      if (!stripeProductId.startsWith("prod_") || !stripePriceId.startsWith("price_")) continue;
      out.push({ key, stripeProductId, stripePriceId, amount, recurring, name, currency });
    }
    return out;
  } catch {
    return [];
  }
}
