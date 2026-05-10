/**
 * Delete seed/demo dog listings from the database.
 * Run from project root: npx tsx scripts/clearSeedListings.ts
 */
import 'dotenv/config';
import { db } from '../server/db';
import { dogListings } from '../shared/schema';
import { inArray } from 'drizzle-orm';

const SEED_NAMES = ['Bella', 'Max', 'Luna', 'Charlie', 'Daisy', 'Rocky', 'Sophie', 'Cooper', 'Buddy'];

async function main() {
  console.log('Removing seed listings:', SEED_NAMES.join(', '));
  const result = await db.delete(dogListings).where(inArray(dogListings.dog_name, SEED_NAMES));
  const deleted = result.rowCount ?? 0;
  console.log('Done. Deleted', deleted, 'listings.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
