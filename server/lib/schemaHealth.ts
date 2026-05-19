import { sql } from 'drizzle-orm';
import { db } from '../db';

export async function buildSchemaHealthReport(): Promise<{
  ok: boolean;
  checkedAt: string;
  tables: Record<string, { exists: boolean }>;
}> {
  const tables = ['profiles', 'posts', 'comments', 'dog_listings', 'blocks', 'pet_service_providers'];
  const result: Record<string, { exists: boolean }> = {};

  for (const table of tables) {
    try {
      await db.execute(sql.raw(`SELECT 1 FROM ${table} LIMIT 1`));
      result[table] = { exists: true };
    } catch {
      result[table] = { exists: false };
    }
  }

  const ok = Object.values(result).every((r) => r.exists);
  return { ok, checkedAt: new Date().toISOString(), tables: result };
}
