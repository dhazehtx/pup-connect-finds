/**
 * Import this module first from server entrypoints so `.env` / `.env.staging`
 * are applied before any other project module reads `process.env`.
 */
import { loadEnv } from './loadEnv';

loadEnv();

// NOTE: `NEON_DATABASE_URL` is intentionally NOT promoted into `DATABASE_URL`.
// The application database is the Supabase Postgres and access must go through an
// explicit `DATABASE_URL`. The stale/disabled Neon endpoint must never be selected
// silently — missing `DATABASE_URL` fails closed in server/db.ts.
