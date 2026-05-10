/**
 * Verify Stripe Price objects match scripts/data/store/prices.csv amounts (usd, one-time).
 * Requires STRIPE_SECRET_KEY. Does not charge cards.
 *
 * Run: npx tsx scripts/store-verify-stripe-prices.ts
 */
import "dotenv/config";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import Stripe from "stripe";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PRICES_CSV = path.join(ROOT, "scripts/data/store/prices.csv");

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error("Missing STRIPE_SECRET_KEY");
    process.exit(1);
  }
  if (!existsSync(PRICES_CSV)) {
    console.error("Missing", PRICES_CSV);
    process.exit(1);
  }

  const raw = readFileSync(PRICES_CSV, "utf8");
  const rows = parse(raw, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

  const stripe = new Stripe(key, { apiVersion: "2025-08-27.basil" as any });

  let ok = 0;
  let fail = 0;
  let skipped = 0;

  for (const row of rows) {
    const priceId = row["Price ID"]?.trim();
    const productId = row["Product ID"]?.trim();
    const expected = parseFloat(String(row["Amount"] ?? ""));
    const interval = (row["Interval"] || "").trim();
    if (!priceId?.startsWith("price_")) continue;

    try {
      const price = await stripe.prices.retrieve(priceId);
      const unit = price.unit_amount != null ? price.unit_amount / 100 : NaN;
      const stripeOneTime = price.type === "one_time";
      const csvOneTime = interval.length === 0;
      const modeMismatch = csvOneTime !== stripeOneTime;
      const amountMismatch = Math.abs(unit - expected) > 0.001;

      if (amountMismatch || modeMismatch) {
        console.error(
          `FAIL ${productId} ${priceId}: csv $${expected.toFixed(2)} vs stripe $${unit.toFixed(2)}; stripe_type=${price.type} csv_interval="${interval || "(empty)"}"`,
        );
        fail++;
      } else {
        console.log(`OK   ${productId} ${priceId} $${unit.toFixed(2)} ${price.currency}`);
        ok++;
      }
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (
        msg.includes("similar object exists in live mode") ||
        msg.includes("similar object exists in test mode") ||
        msg.includes("a test mode key was used") ||
        msg.includes("a live mode key was used")
      ) {
        console.warn(
          `SKIP ${productId} ${priceId}: key mode does not match price mode — use STRIPE_SECRET_KEY from the same Stripe mode as your CSV export.`,
        );
        skipped++;
      } else {
        console.error(`FAIL ${productId} ${priceId}:`, msg);
        fail++;
      }
    }
  }

  console.log(`\nDone. ${ok} ok, ${fail} failed, ${skipped} skipped (mode mismatch).`);
  process.exit(fail > 0 ? 1 : 0);
}

main();
