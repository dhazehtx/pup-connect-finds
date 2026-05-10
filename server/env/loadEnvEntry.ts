/**
 * Import this module first from server entrypoints so `.env` / `.env.staging`
 * are applied before any other project module reads `process.env`.
 */
import { loadEnv } from './loadEnv';

loadEnv();

/** Single pool of env names: Drizzle uses DATABASE_URL; some hosts use NEON_DATABASE_URL. */
const dbUrl =
  process.env.DATABASE_URL?.trim() || process.env.NEON_DATABASE_URL?.trim();
if (dbUrl && !process.env.DATABASE_URL?.trim()) {
  process.env.DATABASE_URL = dbUrl;
}
