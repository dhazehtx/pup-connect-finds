/**
 * Ensure exactly one active row per PAWS Stripe SKU (CSV catalog).
 * CSV sync stores products.id as UUID v5(stripe_product_id). Older Stripe dashboard sync often used id = prod_*,
 * or duplicate inserts may reuse stripe_product_id with a random primary key — both create duplicate storefront rows.
 *
 * For each stripe id in scripts/data/store/products.csv: deactivate rows where stripe_product_id matches but
 * id is not the canonical UUID v5 (same namespace as sync-store-catalog-from-csv.ts).
 *
 * Also deactivates legacy rows whose primary key is literally prod_* when a sibling row declares that stripe id.
 *
 * DRY_RUN=1 — print only
 * Run: npx tsx scripts/dedupe-store-products-by-stripe-id.ts
 */
import "dotenv/config";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import { Pool } from "@neondatabase/serverless";
import { v5 as uuidv5 } from "uuid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PRODUCTS_CSV = path.join(ROOT, "scripts/data/store/products.csv");

const STRIPE_PRODUCT_NAMESPACE = "a1b2c3d4-e5f6-4789-a012-3456789abcde";

type CsvRow = { id?: string };

function loadStripeIdsFromCsv(): string[] {
  if (!existsSync(PRODUCTS_CSV)) {
    console.error(`Missing ${PRODUCTS_CSV}`);
    process.exit(1);
  }
  const raw = readFileSync(PRODUCTS_CSV, "utf8");
  const rows = parse(raw, { columns: true, skip_empty_lines: true, relax_quotes: true }) as CsvRow[];
  return [...new Set(rows.map((r) => r.id?.trim()).filter(Boolean) as string[])];
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!dbUrl) {
    console.error("Missing DATABASE_URL or NEON_DATABASE_URL");
    process.exit(1);
  }

  const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";
  const pool = new Pool({ connectionString: dbUrl });
  const stripeIds = loadStripeIdsFromCsv();

  let deactivated = 0;

  for (const spid of stripeIds) {
    const canonicalId = uuidv5(spid, STRIPE_PRODUCT_NAMESPACE);

    const { rows: keeper } = await pool.query<{ id: string }>(
      `SELECT id::text AS id FROM products WHERE trim(stripe_product_id) = $1 AND id::text = $2 LIMIT 1`,
      [spid, canonicalId],
    );
    if (!keeper.length) {
      console.warn(`[dedupe-stripe] SKIP ${spid}: no canonical row id=${canonicalId} — run npm run store:sync-catalog`);
      continue;
    }

    const { rows: victims } = await pool.query<{ id: string; name: string }>(
      `SELECT id::text AS id, name FROM products
       WHERE is_active = true
         AND trim(stripe_product_id) = $1
         AND id::text <> $2`,
      [spid, canonicalId],
    );

    for (const v of victims) {
      console.log(
        `[dedupe-stripe] ${dryRun ? "would deactivate" : "deactivate"} stripe=${spid} row id=${v.id} name=${v.name}`,
      );
      if (!dryRun) {
        await pool.query(`UPDATE products SET is_active = false, updated_at = NOW() WHERE id::text = $1`, [v.id]);
      }
      deactivated += 1;
    }
  }

  const { rows: legacyPkRows } = await pool.query<{ id: string; name: string }>(
    `SELECT p.id::text AS id, p.name
     FROM products p
     WHERE p.is_active = true
       AND p.id::text LIKE 'prod_%'
       AND EXISTS (
         SELECT 1 FROM products c
         WHERE trim(c.stripe_product_id) = trim(p.id::text)
           AND c.id::text <> p.id::text
       )`,
  );

  console.log(`[dedupe-stripe] Legacy prod_* PK rows with CSV sibling: ${legacyPkRows.length}`);

  for (const v of legacyPkRows) {
    console.log(`[dedupe-stripe] ${dryRun ? "would deactivate" : "deactivate"} legacy PK id=${v.id} name=${v.name}`);
    if (!dryRun) {
      await pool.query(`UPDATE products SET is_active = false, updated_at = NOW() WHERE id::text = $1`, [v.id]);
    }
    deactivated += 1;
  }

  console.log(`[dedupe-stripe] Done. ${dryRun ? "Would deactivate" : "Deactivated"} rows: ${deactivated}`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
