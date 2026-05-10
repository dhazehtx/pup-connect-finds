import { config } from 'dotenv';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Loads environment variables without replacing production-only files.
 * Order:
 * 1. `.env` (optional) — same as classic `dotenv/config` when present
 * 2. If `NODE_ENV === 'staging'`, `.env.staging` (optional) with **override**
 *
 * Set `NODE_ENV=staging` before starting the process (e.g. in your host or `npm run start:staging`).
 * Does not read or modify `.env` contents on disk.
 */
export function loadEnv(cwd: string = process.cwd()): void {
  const base = path.join(cwd, '.env');
  if (existsSync(base)) {
    config({ path: base });
  }

  const nodeEnv = process.env.NODE_ENV || 'development';
  if (nodeEnv === 'staging') {
    const staging = path.join(cwd, '.env.staging');
    if (existsSync(staging)) {
      config({ path: staging, override: true });
    } else {
      console.warn(
        '[env] NODE_ENV=staging but .env.staging not found — only .env (if any) is loaded. Copy .env.staging.example → .env.staging',
      );
    }
  }
}
