import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

type AppDb = NeonDatabase<typeof schema>;

const MISSING_DB_MSG =
  "DATABASE_URL is not set. The application database is the Supabase Postgres — set DATABASE_URL to the connection string from Supabase Project Settings → Database (Railway → Variables, or repo-root .env). NEON_DATABASE_URL is no longer used as a fallback; missing DATABASE_URL fails closed.";

/** DATABASE_URL only. The stale Neon alias is never used as a runtime fallback. */
function readDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL?.trim() || undefined;
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
