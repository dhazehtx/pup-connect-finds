/**
 * Step 1/2 regression: the escrow INSERT policy migration removes the unrestricted
 * WITH CHECK(true) and replaces it with an owner-scoped rule; and the three
 * prepared migrations together cover the full closed-beta hardening set.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const MIG = (name: string) =>
  readFileSync(path.resolve(__dirname, '../supabase/migrations/', name), 'utf8');

/** Strip `--` comment lines so assertions test executable SQL, not explanations. */
const stripComments = (sql: string) =>
  sql
    .split('\n')
    .filter((l) => !/^\s*--/.test(l))
    .join('\n');

describe('Step 1 — escrow INSERT policy hardening', () => {
  const sql = MIG('20260824000002_escrow_insert_policy_hardening.sql');

  it('does NOT define an unrestricted WITH CHECK(true) for escrow inserts', () => {
    // No executable `WITH CHECK (true)` (comment mentions of the old policy are fine).
    expect(stripComments(sql)).not.toMatch(/WITH\s+CHECK\s*\(\s*true\s*\)/i);
  });

  it('drops the permissive live policy and creates an owner-scoped INSERT policy', () => {
    expect(sql).toMatch(/DROP POLICY IF EXISTS "System can insert escrow transactions"/i);
    expect(sql).toMatch(/CREATE POLICY "Users can insert their own escrow transactions"/i);
    expect(sql).toMatch(/FOR INSERT/i);
    // owner-scoped rule matching the table's SELECT/UPDATE policies
    expect(sql).toMatch(/WITH CHECK\s*\(\s*buyer_id = auth\.uid\(\)\s+OR\s+seller_id = auth\.uid\(\)\s*\)/i);
  });

  it('is policy-only and additive (no destructive schema/data ops)', () => {
    expect(sql).not.toMatch(/\bDROP\s+TABLE\b/i);
    expect(sql).not.toMatch(/\bDROP\s+COLUMN\b/i);
    expect(sql).not.toMatch(/\bTRUNCATE\b/i);
    expect(sql).not.toMatch(/\bDELETE\s+FROM\b/i);
  });

  it('is guarded/idempotent (table existence check + drop-before-create)', () => {
    expect(sql).toMatch(/IF EXISTS[\s\S]*escrow_transactions/i);
    expect(sql).toMatch(/DROP POLICY IF EXISTS "Users can insert their own escrow transactions"/i);
  });
});

describe('Step 2 — the three prepared migrations cover the full hardening set', () => {
  const rls = MIG('20260824000000_rls_storage_privacy_hardening.sql');
  const beta = MIG('20260824000001_beta_critical_tables.sql');
  const escrow = MIG('20260824000002_escrow_insert_policy_hardening.sql');

  it('beta-critical tables are created', () => {
    for (const t of ['bookmarks', 'saved_posts', 'qa_bug_reports']) {
      expect(beta).toMatch(new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${t}\\b`, 'i'));
    }
  });

  it('ID/message buckets are made private', () => {
    expect(rls).toMatch(/UPDATE storage\.buckets SET public = false WHERE id = 'provider-id-docs'/);
    expect(rls).toMatch(/UPDATE storage\.buckets SET public = false WHERE id = 'message-attachments'/);
  });

  it('authenticated profile PII exposure is removed (column SELECT revoke)', () => {
    for (const c of ['email', 'phone', 'two_factor_secret', 'backup_codes']) {
      expect(rls).toContain(`'${c}'`);
    }
    expect(rls).toMatch(/REVOKE SELECT \(%I\)/i);
  });

  it('self-admin/self-verified/self-role escalation is blocked (column UPDATE revoke)', () => {
    for (const c of ['is_admin', 'verified', 'role', 'is_suspended']) {
      expect(rls).toContain(`'${c}'`);
    }
    expect(rls).toMatch(/REVOKE UPDATE \(%I\)/i);
  });

  it('analytics tables are locked (RLS enabled)', () => {
    expect(rls).toMatch(/subscription_analytics/);
    expect(rls).toMatch(/ENABLE ROW LEVEL SECURITY/i);
  });

  it('the permissive escrow insert policy is removed', () => {
    expect(escrow).toMatch(/DROP POLICY IF EXISTS "System can insert escrow transactions"/i);
    expect(stripComments(escrow)).not.toMatch(/WITH\s+CHECK\s*\(\s*true\s*\)/i);
  });
});
