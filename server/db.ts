import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const databaseUrl =
  process.env.DATABASE_URL?.trim() || process.env.NEON_DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL or NEON_DATABASE_URL must be set (same Postgres as Supabase: use the connection string from Supabase Project Settings → Database, or your Neon URL). Add it to .env in the repo root.",
  );
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });
