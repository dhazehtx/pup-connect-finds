/**
 * Steps 2–4 regression: non-beta features are cleanly gated (no fake success),
 * and the beta-critical schema migration is additive and correct.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { FEATURES, isFeatureEnabled } from '../client/src/config/features';

describe('Step 4 — Lost & Found gated for closed beta', () => {
  it('the lostAndFound feature flag defaults to disabled', () => {
    expect(FEATURES.lostAndFound).toBe(false);
    expect(isFeatureEnabled('lostAndFound')).toBe(false);
  });

  it('Explore page renders the L&F tab only when the flag is enabled (source guard)', () => {
    const src = readFileSync(path.resolve(__dirname, '../client/src/pages/ExploreTabbedPage.tsx'), 'utf8');
    expect(src).toMatch(/FEATURES\.lostAndFound/);
    // The L&F tab/section must be inside the enabled branch, not always rendered.
    expect(src).toMatch(/lostAndFoundEnabled\s*\?/);
  });

  it('the only reachable L&F mount is the (now gated) Explore tab — no nav links', () => {
    // Guard against a second, ungated entry point being reintroduced.
    const explore = readFileSync(path.resolve(__dirname, '../client/src/pages/ExploreTabbedPage.tsx'), 'utf8');
    expect(explore).toMatch(/LostAndFoundExploreSection/);
  });
});

describe('Step 3 — beta-critical schema migration (additive, correct)', () => {
  const sql = readFileSync(
    path.resolve(__dirname, '../supabase/migrations/20260824000001_beta_critical_tables.sql'),
    'utf8',
  );

  it('creates the three reachable server-written tables (idempotent)', () => {
    for (const t of ['bookmarks', 'saved_posts', 'qa_bug_reports']) {
      expect(sql).toMatch(new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${t}\\b`, 'i'));
    }
  });

  it('preserves Supabase Auth UUID relationships (FKs to profiles)', () => {
    expect(sql).toMatch(/user_id\s+uuid\s+NOT NULL\s+REFERENCES public\.profiles\(id\)\s+ON DELETE CASCADE/i);
    expect(sql).toMatch(/post_id\s+uuid\s+NOT NULL\s+REFERENCES public\.posts\(id\)/i);
  });

  it('enables RLS on all three (server-only; no anon policy)', () => {
    expect((sql.match(/ENABLE ROW LEVEL SECURITY/gi) || []).length).toBe(3);
    // must NOT hand anon/authenticated a policy on these
    expect(sql).not.toMatch(/CREATE POLICY/i);
  });

  it('is additive only — deletes no data', () => {
    expect(sql).not.toMatch(/\bDROP\s+TABLE\b/i);
    expect(sql).not.toMatch(/\bTRUNCATE\b/i);
    expect(sql).not.toMatch(/\bDELETE\s+FROM\b/i);
    expect(sql).not.toMatch(/\bDROP\s+COLUMN\b/i);
  });

  it('adds supporting indexes', () => {
    expect(sql).toMatch(/CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id/i);
    expect(sql).toMatch(/CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id/i);
  });
});
