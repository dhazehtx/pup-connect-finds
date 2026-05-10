/**
 * Applies migrations/20260404_ensure_pet_service_providers_schema.sql to DATABASE_URL.
 * Usage (from repo root): npx tsx scripts/apply-pet-service-migration.ts
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../server/db";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const path = join(__dirname, "../migrations/20260404_ensure_pet_service_providers_schema.sql");
  const sql = readFileSync(path, "utf8");
  await pool.query(sql);
  console.log("OK: applied", path);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
