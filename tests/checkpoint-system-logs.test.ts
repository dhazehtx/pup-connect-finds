/**
 * Structural regression for the system_logs candidate migration (20260824000005).
 * system_logs backs server/services/loggingService.ts (db.insert(systemLogs)); the
 * table was missing in prod so persisted logs were dropped. The migration must
 * create it server-only (RLS on, no policy, client grants revoked) with columns
 * matching the Drizzle `systemLogs` schema.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');
const mig = read('supabase/migrations/20260824000005_system_logs.sql');
const schema = read('shared/schema.ts');
const stripComments = (s: string) => s.split('\n').filter((l) => !/^\s*--/.test(l)).map((l) => l.replace(/--.*$/, '')).join('\n');
const sql = stripComments(mig);

describe('20260824000005 — system_logs is created server-only', () => {
  it('creates public.system_logs (idempotent) with the required key columns', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS public\.system_logs/i);
    for (const col of ['log_id', 'level', 'category', 'message', 'details', 'created_at']) {
      expect(sql).toMatch(new RegExp(`\\b${col}\\b`));
    }
    expect(sql).toMatch(/log_id\s+text\s+NOT NULL\s+UNIQUE/i);
  });

  it('enables RLS with NO policy and revokes client-role grants (server-only)', () => {
    expect(sql).toMatch(/ALTER TABLE public\.system_logs ENABLE ROW LEVEL SECURITY/i);
    expect(sql).not.toMatch(/CREATE\s+POLICY/i);
    expect(sql).toMatch(/REVOKE ALL PRIVILEGES ON public\.system_logs FROM anon/i);
    expect(sql).toMatch(/REVOKE ALL PRIVILEGES ON public\.system_logs FROM authenticated/i);
  });

  it('is additive and destructive-op free', () => {
    expect(sql).not.toMatch(/\bDROP\s+TABLE\b/i);
    expect(sql).not.toMatch(/\bTRUNCATE\b/i);
    expect(sql).not.toMatch(/\bDELETE\s+FROM\b/i);
  });

  it('the Drizzle systemLogs schema still exists (the migration mirrors it)', () => {
    expect(schema).toMatch(/export const systemLogs = pgTable\("system_logs"/);
    expect(schema).toMatch(/log_id:\s*text\("log_id"\)\.notNull\(\)\.unique\(\)/);
  });
});
