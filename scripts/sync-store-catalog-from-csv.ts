/**
 * Upsert PAWS store products from Stripe exports:
 *   scripts/data/store/products.csv
 *   scripts/data/store/prices.csv
 *
 * Hero images: client/public/products/<stripe_product_id>.png
 * Run: npx tsx scripts/sync-store-catalog-from-csv.ts
 */
import "dotenv/config";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import { Pool } from "@neondatabase/serverless";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "scripts/data/store");
const PUBLIC_PRODUCTS = path.join(ROOT, "client/public/products");

import { dbProductIdFromStripeProductId, dbProductIdForPupboxVariant } from "../server/lib/storeProductId.ts";
import { parsePupboxCatalogFromEnv } from "../server/lib/pupboxCatalog.ts";

type ProductRow = { id: string; Name: string; Description: string };
type PriceRow = Record<string, string>;

const TRACHEA_GALLERY = [1, 2, 3, 4, 5].map(
  (n) => `/products/prod_USR0Nq9QMckOyn_g${n}.png`,
);

type Extra = {
  category?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  is_featured?: boolean;
};

const EXTRA_BY_STRIPE_ID: Record<string, Extra> = {
  prod_USRR9aXU62P4rX: { category: "Toys", tags: ["Heavy chewer"], is_featured: true },
  prod_USR838JxXLxtx0: { category: "Toys", tags: ["No stuffing"], is_featured: true },
  prod_USRUunXPhQp1Yk: { category: "Toys", is_featured: true },
  prod_USREY8rPxycmF7: { category: "Toys" },
  prod_USRCfiXAucvR7E: { category: "Accessories" },
  prod_USR7XPz0sXh11t: { category: "Accessories" },
  prod_USR0Nq9QMckOyn: {
    category: "Food & Treats",
    tags: ["Light chew"],
    metadata: { gallery: TRACHEA_GALLERY },
  },
  prod_USQxZZxRpYVbka: { category: "Food & Treats" },
  prod_URoE7Sadw6NG1r: { category: "Food & Treats" },
  prod_URndh1k6a89Td6: { category: "Food & Treats" },
};

function extraForStripeId(stripeId: string): Extra {
  return EXTRA_BY_STRIPE_ID[stripeId] || {};
}

function heroImageUrl(stripeProductId: string): string | null {
  const png = path.join(PUBLIC_PRODUCTS, `${stripeProductId}.png`);
  return existsSync(png) ? `/products/${stripeProductId}.png` : null;
}

function loadCsv<T>(file: string): T[] {
  const raw = readFileSync(file, "utf8");
  return parse(raw, { columns: true, skip_empty_lines: true, relax_quotes: true }) as T[];
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!dbUrl) {
    console.error("Missing DATABASE_URL or NEON_DATABASE_URL");
    process.exit(1);
  }

  const productsPath = path.join(DATA_DIR, "products.csv");
  const pricesPath = path.join(DATA_DIR, "prices.csv");
  if (!existsSync(productsPath) || !existsSync(pricesPath)) {
    console.error("Missing scripts/data/store/products.csv or prices.csv");
    process.exit(1);
  }

  const productRows = loadCsv<ProductRow>(productsPath);
  const priceRows = loadCsv<PriceRow>(pricesPath);

  const priceByProduct = new Map<
    string,
    { priceId: string; amount: string; currency: string; recurring: boolean }
  >();
  for (const row of priceRows) {
    const pid = row["Product ID"]?.trim();
    if (!pid) continue;
    const interval = (row["Interval"] || "").trim();
    priceByProduct.set(pid, {
      priceId: row["Price ID"]?.trim(),
      amount: String(row["Amount"] ?? "").trim(),
      currency: (row["Currency"] || "usd").trim().toLowerCase(),
      recurring: interval.length > 0,
    });
  }

  const pool = new Pool({ connectionString: dbUrl });

  let upserted = 0;
  for (const p of productRows) {
    const stripeProductId = p.id?.trim();
    if (!stripeProductId) continue;

    const pricing = priceByProduct.get(stripeProductId);
    if (!pricing) {
      console.warn(`[sync-store] No price row for ${stripeProductId} — skipping`);
      continue;
    }
    const rowId = dbProductIdFromStripeProductId(stripeProductId);
    const imageUrl = heroImageUrl(stripeProductId);
    const extra = extraForStripeId(stripeProductId);
    const metadataJson =
      extra.metadata && Object.keys(extra.metadata).length > 0
        ? JSON.stringify(extra.metadata)
        : null;

    await pool.query(
      `INSERT INTO products (
        id, name, description, unit_price, currency,
        stripe_price_id, stripe_product_id, image_url,
        inventory_qty, is_active, is_subscription, is_featured,
        category, tags, metadata, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10, $11, $12,
        $13, $14, $15::jsonb, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        unit_price = EXCLUDED.unit_price,
        currency = EXCLUDED.currency,
        stripe_price_id = EXCLUDED.stripe_price_id,
        stripe_product_id = EXCLUDED.stripe_product_id,
        image_url = EXCLUDED.image_url,
        inventory_qty = EXCLUDED.inventory_qty,
        is_active = EXCLUDED.is_active,
        is_subscription = EXCLUDED.is_subscription,
        is_featured = EXCLUDED.is_featured,
        category = COALESCE(EXCLUDED.category, products.category),
        tags = COALESCE(EXCLUDED.tags, products.tags),
        metadata = COALESCE(EXCLUDED.metadata, products.metadata),
        updated_at = NOW()`,
      [
        rowId,
        p.Name?.trim(),
        (p.Description || "").trim() || null,
        pricing.amount,
        pricing.currency,
        pricing.priceId,
        stripeProductId,
        imageUrl,
        100,
        true,
        pricing.recurring,
        extra.is_featured === true,
        extra.category ?? null,
        extra.tags ?? null,
        metadataJson,
      ],
    );
    upserted++;
    console.log(`[sync-store] Upserted ${stripeProductId} → ${rowId}`);
  }

  const ph = await pool.query(
    `UPDATE products SET is_active = false, updated_at = NOW()
     WHERE image_url ILIKE '%via.placeholder.com%'`,
  );
  console.log(`[sync-store] Deactivated via.placeholder rows: ${ph.rowCount ?? 0}`);

  const pupEntries = parsePupboxCatalogFromEnv();
  for (const e of pupEntries) {
    // Variant-scoped id (product + price): monthly and one-time variants that
    // share a Stripe Product get DISTINCT purchasable rows — the previous
    // product-only derivation collided them (second upsert overwrote the first).
    const rowId = dbProductIdForPupboxVariant(e.stripeProductId, e.stripePriceId);
    const imageUrl = heroImageUrl(e.stripeProductId);
    const tags = ["pup-box"];
    await pool.query(
      `INSERT INTO products (
        id, name, description, unit_price, currency,
        stripe_price_id, stripe_product_id, image_url,
        inventory_qty, is_active, is_subscription, is_featured,
        category, tags, metadata, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10, $11, false,
        $12, $13, NULL::jsonb, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        unit_price = EXCLUDED.unit_price,
        currency = EXCLUDED.currency,
        stripe_price_id = EXCLUDED.stripe_price_id,
        stripe_product_id = EXCLUDED.stripe_product_id,
        image_url = COALESCE(EXCLUDED.image_url, products.image_url),
        inventory_qty = EXCLUDED.inventory_qty,
        is_active = true,
        is_subscription = EXCLUDED.is_subscription,
        category = COALESCE(EXCLUDED.category, products.category),
        tags = COALESCE(EXCLUDED.tags, products.tags),
        updated_at = NOW()`,
      [
        rowId,
        e.name,
        `Pup Box — ${e.name}`,
        e.amount,
        (e.currency || "usd").toLowerCase(),
        e.stripePriceId,
        e.stripeProductId,
        imageUrl,
        9999,
        true,
        e.recurring,
        "Pup Box",
        tags,
      ],
    );
    upserted++;
    console.log(`[sync-store] Pup Box upserted ${e.key} (${e.stripeProductId}) → ${rowId}`);
  }
  if (pupEntries.length > 0) {
    // Self-heal: deactivate legacy Pup Box rows keyed by the OLD product-only
    // derivation (the collided 3-row state). Guarded by the pup-box tag so no
    // Store CSV row can ever be touched, and idempotent (no-op once inactive).
    const variantIds = new Set(
      pupEntries.map((e) => dbProductIdForPupboxVariant(e.stripeProductId, e.stripePriceId)),
    );
    const legacyIds = [
      ...new Set(pupEntries.map((e) => dbProductIdFromStripeProductId(e.stripeProductId))),
    ].filter((id) => !variantIds.has(id));
    if (legacyIds.length > 0) {
      const legacy = await pool.query(
        `UPDATE products SET is_active = false, updated_at = NOW()
         WHERE id = ANY($1::text[]) AND tags @> ARRAY['pup-box'] AND is_active = true`,
        [legacyIds],
      );
      console.log(`[sync-store] Deactivated legacy collided Pup Box rows: ${legacy.rowCount ?? 0}`);
    }
  } else {
    console.log("[sync-store] No PUPBOX_CATALOG_JSON — skip Pup Box rows (optional).");
  }

  await pool.end();
  console.log(`[sync-store] Done. Upserted ${upserted} products (including Pup Box env entries).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
