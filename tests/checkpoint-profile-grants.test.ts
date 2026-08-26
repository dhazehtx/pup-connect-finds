/**
 * Session 8 regression: the corrected profiles-privilege migration.
 *
 * Production holds TABLE-LEVEL privileges on public.profiles for
 * anon/authenticated (Supabase default GRANT ALL). Postgres column-level
 * REVOKEs do not subtract from a table-level grant, so the migration must
 * (A) revoke the table-level privileges first and (B) grant back only the
 * minimal public column set. These tests pin that mechanism so a later edit
 * cannot silently restore broad profile access:
 *   - the table-level REVOKEs must stay, and must precede the grants
 *   - the SELECT grant list must remain exactly the audited public columns
 *   - no UPDATE/INSERT/DELETE (or table-level) grant may appear
 *   - is_admin / role / verified / is_suspended stay non-client-updatable
 * Also covers 20260824000003 (conversation_participants server-only RLS) and
 * the advanced-search edge function's anon count (must not select '*' on
 * profiles, which would expand to revoked columns).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');
const rls = read('supabase/migrations/20260824000000_rls_storage_privacy_hardening.sql');
const participants = read('supabase/migrations/20260824000003_conversation_participants_rls.sql');
const advancedSearch = read('supabase/functions/advanced-search/index.ts');

/** Strip `--` comment lines so assertions test executable SQL, not explanations. */
const stripComments = (sql: string) =>
  sql
    .split('\n')
    .filter((l) => !/^\s*--/.test(l))
    .join('\n');

const rlsSql = stripComments(rls);

/** The audited public marketplace column set (Session 8 client callsite audit). */
const PUBLIC_COLUMNS = [
  'id',
  'username',
  'full_name',
  'avatar_url',
  'location',
  'verified',
  'rating',
  'total_reviews',
].sort();

/** Columns ordinary clients must never regain direct SELECT on. */
const SENSITIVE_SELECT = [
  'email',
  'phone',
  'address',
  'city',
  'state',
  'zip_code',
  'verification_document',
  'breeder_license',
  'fraud_score',
  'profile_status',
  'is_admin',
  'role',
  'is_suspended',
  'suspended_reason',
  'suspended_at',
  'last_login_ip',
  'last_login_at',
  'suspicious_activity_count',
  'stripe_account_id',
  'stripe_connected',
  'two_factor_secret',
  'two_factor_enabled',
  'backup_codes',
  'privacy_settings',
  'social_providers',
];

/** Extract the client_read grant array from the migration's executable SQL. */
function grantedColumns(): string[] {
  const m = rlsSql.match(/client_read\s+text\[\]\s*:=\s*ARRAY\[([\s\S]*?)\]/);
  expect(m, 'client_read grant array must exist in the migration').toBeTruthy();
  return [...m![1].matchAll(/'([^']+)'/g)].map((x) => x[1]).sort();
}

describe('20260824000000 — profiles table-level privileges are actually removed', () => {
  it('revokes ALL table-level privileges from PUBLIC, anon, and authenticated', () => {
    expect(rlsSql).toMatch(/REVOKE ALL PRIVILEGES ON public\.profiles FROM PUBLIC;/);
    expect(rlsSql).toMatch(/REVOKE ALL PRIVILEGES ON public\.profiles FROM anon;/);
    expect(rlsSql).toMatch(/REVOKE ALL PRIVILEGES ON public\.profiles FROM authenticated;/);
  });

  it('revokes BEFORE granting (order matters: grants must be the final state)', () => {
    const firstRevoke = rlsSql.indexOf('REVOKE ALL PRIVILEGES ON public.profiles');
    const firstGrant = rlsSql.indexOf('GRANT SELECT');
    expect(firstRevoke).toBeGreaterThan(-1);
    expect(firstGrant).toBeGreaterThan(-1);
    expect(firstRevoke).toBeLessThan(firstGrant);
  });

  it('grants back EXACTLY the audited public column set (nothing more, nothing less)', () => {
    expect(grantedColumns()).toEqual(PUBLIC_COLUMNS);
  });

  it('uses only per-column SELECT grants (no table-level or wildcard grant)', () => {
    // the only GRANT in the file is the guarded column-level SELECT
    expect(rlsSql).toMatch(/GRANT SELECT \(%I\) ON public\.profiles TO anon, authenticated/);
    expect(rlsSql).not.toMatch(/GRANT\s+ALL/i);
    // no table-level SELECT grant (column grants always parenthesize the column)
    expect(rlsSql).not.toMatch(/GRANT SELECT\s+ON/i);
  });

  it('legitimate public marketplace columns remain available (regression guard)', () => {
    const granted = grantedColumns();
    for (const col of ['username', 'full_name', 'avatar_url', 'verified', 'location', 'rating', 'total_reviews', 'id']) {
      expect(granted, `${col} must stay client-readable — active embeds depend on it`).toContain(col);
    }
  });

  it('sensitive/PII/security columns are NOT restored to client SELECT', () => {
    const granted = grantedColumns();
    for (const col of SENSITIVE_SELECT) {
      expect(granted, `${col} must not be client-readable`).not.toContain(col);
    }
    // belt-and-braces: no executable statement mentions these columns at all
    for (const col of ['email', 'phone', 'two_factor_secret', 'backup_codes', 'last_login_ip']) {
      expect(rlsSql).not.toContain(`'${col}'`);
    }
  });

  it('grants NO UPDATE/INSERT/DELETE privilege of any kind to client roles', () => {
    expect(rlsSql).not.toMatch(/GRANT\s+UPDATE/i);
    expect(rlsSql).not.toMatch(/GRANT\s+INSERT/i);
    expect(rlsSql).not.toMatch(/GRANT\s+DELETE/i);
  });

  // The four privilege fields, individually pinned: with all table-level
  // privileges revoked and no UPDATE grant present, none of these can be
  // written through PostgREST by anon/authenticated.
  for (const col of ['is_admin', 'role', 'verified', 'is_suspended']) {
    it(`${col} cannot be directly client-updated`, () => {
      expect(rlsSql).toMatch(/REVOKE ALL PRIVILEGES ON public\.profiles FROM authenticated;/);
      expect(rlsSql).not.toMatch(/GRANT\s+UPDATE/i);
      if (col !== 'verified') {
        // and it must not even be client-readable (verified alone is public marketplace data)
        expect(grantedColumns()).not.toContain(col);
      }
    });
  }
});

describe('20260824000003 — conversation_participants is server-only', () => {
  const sql = stripComments(participants);

  it('enables RLS and revokes client-role grants', () => {
    expect(sql).toMatch(/ALTER TABLE public\.conversation_participants ENABLE ROW LEVEL SECURITY/);
    expect(sql).toMatch(/REVOKE ALL PRIVILEGES ON public\.conversation_participants FROM PUBLIC, anon, authenticated/);
  });

  it('creates NO policy (default deny for client roles; owner/server bypasses RLS)', () => {
    expect(sql).not.toMatch(/CREATE\s+POLICY/i);
  });

  it('is guarded, additive, and destructive-op free', () => {
    expect(participants).toMatch(/IF EXISTS[\s\S]*conversation_participants/i);
    expect(sql).not.toMatch(/\bDROP\s+TABLE\b/i);
    expect(sql).not.toMatch(/\bTRUNCATE\b/i);
    expect(sql).not.toMatch(/\bDELETE\s+FROM\b/i);
  });
});

describe('advanced-search edge function — anon-key profile counts survive the grants', () => {
  it("no longer counts with select('*') on profiles (would expand to revoked columns)", () => {
    expect(advancedSearch).not.toMatch(/from\(['"]profiles['"]\)\s*\.select\(\s*['"]\*/);
  });

  it("counts on the granted 'id' column instead", () => {
    expect(advancedSearch).toMatch(
      /from\('profiles'\)\.select\('id',\s*\{\s*count:\s*'exact',\s*head:\s*true\s*\}\)/,
    );
  });
});
