import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

type AppDb = NeonDatabase<typeof schema>;

const MISSING_DB_MSG =
  "DATABASE_URL or NEON_DATABASE_URL must be set (same Postgres as Supabase: use the connection string from Supabase Project Settings → Database, or your Neon URL). Add it to .env in the repo root, or set the variable on your host (e.g. Railway → Variables).";

function readDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL?.trim() || process.env.NEON_DATABASE_URL?.trim()
  );
}

let _pool: Pool | null = null;
let _db: AppDb | null = null;

/** Throws with the same message as before if env is missing (first DB use). */
function ensureClient(): { pool: Pool; db: AppDb } {
  const databaseUrl = readDatabaseUrl();
  if (!databaseUrl) {
    throw new Error(MISSING_DB_MSG);
  }
  if (!_pool || !_db) {
    _pool = new Pool({ connectionString: databaseUrl });
    _db = drizzle({ client: _pool, schema });
  }
  return { pool: _pool, db: _db };
}

/**
 * Lazy Postgres client so the Node process can boot (e.g. Railway `/api/health/live`)
 * before `DATABASE_URL` is configured. Any route that touches `db` or `pool` will throw
 * until the variable is set.
 */
export const pool = new Proxy({} as Pool, {
  get(_target, prop, receiver) {
    const real = ensureClient().pool;
    const value = Reflect.get(real as object, prop, receiver);
    return typeof value === "function" ? (value as Function).bind(real) : value;
  },
}) as Pool;

export const db = new Proxy({} as AppDb, {
  get(_target, prop, receiver) {
    const real = ensureClient().db;
    const value = Reflect.get(real as object, prop, receiver);
    return typeof value === "function" ? (value as Function).bind(real) : value;
  },
}) as AppDb;
