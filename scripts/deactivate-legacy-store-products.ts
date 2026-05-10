/**
 * Deactivate products that are not in the PAWS Stripe catalog (scripts/data/store/products.csv).
 * Run after `npm run store:sync-catalog` so the DB matches CSV-backed SKUs only.
 *
 * - Sets is_active = false for rows whose stripe_product_id is missing or not in the CSV allowlist.
 * - DRY_RUN=1: print rows that would be updated; no writes.
 *
 * Run: npx tsx scripts/deactivate-legacy-store-products.ts
 */
import "dotenv/config";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import { Pool } from "@neondatabase/serverless";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PRODUCTS_CSV = path.join(ROOT, "scripts/data/store/products.csv");

type CsvRow = { id?: string };

function loadAllowedStripeIds(): string[] {
  if (!existsSync(PRODUCTS_CSV)) {
    console.error(`Missing ${PRODUCTS_CSV}`);
    process.exit(1);
  }
  const raw = readFileSync(PRODUCTS_CSV, "utf8");
  const rows = parse(raw, { columns: true, skip_empty_lines: true, relax_quotes: true }) as CsvRow[];
  const ids = rows.map((r) => r.id?.trim()).filter(Boolean) as string[];
  return [...new Set(ids)];
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!dbUrl) {
    console.error("Missing DATABASE_URL or NEON_DATABASE_URL");
    process.exit(1);
  }

  const allowed = loadAllowedStripeIds();
  if (allowed.length === 0) {
    console.error("No product ids found in products.csv");
    process.exit(1);
  }

  const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";
  const pool = new Pool({ connectionString: dbUrl });

  const placeholders = allowed.map((_, i) => `$${i + 1}`).join(", ");

  const listSql = `
    SELECT id, name, stripe_product_id, image_url
    FROM products
    WHERE is_active = true
      AND (
        stripe_product_id IS NULL
        OR trim(stripe_product_id) = ''
        OR stripe_product_id NOT IN (${placeholders})
      )
    ORDER BY name
  `;

  const { rows } = await pool.query(listSql, allowed);

  console.log(`[deactivate-legacy] Allowlist: ${allowed.length} Stripe product ids from products.csv`);
  console.log(`[deactivate-legacy] Rows ${dryRun ? "that would be " : ""}deactivated: ${rows.length}`);

  for (const r of rows as Array<{ id: string; name: string; stripe_product_id: string | null; image_url: string | null }>) {
    console.log(
      `  - ${r.name} | stripe_product_id=${r.stripe_product_id ?? "null"} | id=${r.id} | image_url=${r.image_url ? "set" : "—"}`,
    );
  }

  if (dryRun || rows.length === 0) {
    await pool.end();
    process.exit(0);
  }

  const updateSql = `
    UPDATE products
    SET is_active = false, updated_at = NOW()
    WHERE is_active = true
      AND (
        stripe_product_id IS NULL
        OR trim(stripe_product_id) = ''
        OR stripe_product_id NOT IN (${placeholders})
      )
  `;

  const result = await pool.query(updateSql, allowed);
  console.log(`[deactivate-legacy] Updated row count: ${result.rowCount ?? "?"}`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
