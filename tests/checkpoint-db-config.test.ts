/**
 * Step 1 regression: the application DB access requires DATABASE_URL and must
 * fail closed when it is missing — never silently falling back to the stale
 * NEON_DATABASE_URL endpoint.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('Step 1 — DATABASE_URL fail-closed (no Neon runtime fallback)', () => {
  const OLD = { ...process.env };
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    process.env = { ...OLD };
  });

  it('throws a clear config error when DATABASE_URL is unset, even if NEON_DATABASE_URL is set', async () => {
    delete process.env.DATABASE_URL;
    process.env.NEON_DATABASE_URL = 'postgres://user:pw@disabled-neon-endpoint.neon.tech/db?sslmode=require';
    const { db } = await import('../server/db');
    // Accessing the proxy triggers client creation, which must fail closed.
    let err: unknown;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (db as any).select;
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(Error);
    expect(String(err)).toMatch(/DATABASE_URL is not set/i);
    expect(String(err)).toMatch(/fails closed/i);
    // It must NOT reference the Neon endpoint as a usable fallback.
    expect(String(err)).not.toMatch(/neon-endpoint/i);
  });

  it('pool access also fails closed with the same DATABASE_URL error', async () => {
    delete process.env.DATABASE_URL;
    process.env.NEON_DATABASE_URL = 'postgres://neon';
    const { pool } = await import('../server/db');
    let err: unknown;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (pool as any).query;
    } catch (e) {
      err = e;
    }
    expect(String(err)).toMatch(/DATABASE_URL/);
  });

  it('does not promote NEON_DATABASE_URL into DATABASE_URL (source guard)', () => {
    const src = readFileSync(path.resolve(__dirname, '../server/env/loadEnvEntry.ts'), 'utf8');
    // No assignment of process.env.DATABASE_URL from NEON.
    expect(src).not.toMatch(/process\.env\.DATABASE_URL\s*=/);
    expect(src).toMatch(/intentionally NOT promoted/i);
  });

  it('server/db.ts reads DATABASE_URL only (no `|| NEON` fallback)', () => {
    const src = readFileSync(path.resolve(__dirname, '../server/db.ts'), 'utf8');
    // The readDatabaseUrl helper must not OR in NEON_DATABASE_URL.
    const readFn = src.slice(src.indexOf('function readDatabaseUrl'), src.indexOf('function readDatabaseUrl') + 200);
    expect(readFn).not.toMatch(/NEON_DATABASE_URL/);
    expect(readFn).toMatch(/process\.env\.DATABASE_URL/);
  });
});
