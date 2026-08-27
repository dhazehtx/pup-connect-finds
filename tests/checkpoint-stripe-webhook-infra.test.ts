/**
 * Regression: the minimal Stripe webhook-infrastructure migration
 * (20260824000004) must create exactly the two server-only tables the deployed
 * webhook contract needs — and nothing from the legacy stripe.sql that touches
 * unrelated objects. Pins:
 *   - stripe_idempotency + stripe_events created, event_id PRIMARY KEY
 *   - stripe_events.payload is jsonb, type NOT NULL, created_at present
 *   - RLS enabled, no policy (server-only, default deny)
 *   - client-role grants revoked
 *   - NO unrelated schema changes (orders / providers / payouts / functions)
 * Also guards the code contract so a future edit to the tables keeps matching.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');
const mig = read('supabase/migrations/20260824000004_stripe_webhook_infra.sql');
const idempotencySrc = read('server/lib/idempotency.ts');
const handlersSrc = read('server/lib/stripe-handlers.ts');

// Strip full-line AND trailing inline `-- ...` comments so scope assertions
// test executable SQL only (the migration's own comments describe what it does
// NOT do — e.g. "does NOT touch orders" — and must not trip the guards).
const stripComments = (sql: string) =>
  sql
    .split('\n')
    .filter((l) => !/^\s*--/.test(l))
    .map((l) => l.replace(/--.*$/, ''))
    .join('\n');
const sql = stripComments(mig);

describe('20260824000004 — creates the two webhook tables with the right shape', () => {
  it('creates stripe_idempotency with event_id PRIMARY KEY', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS public\.stripe_idempotency/i);
    expect(sql).toMatch(/stripe_idempotency[\s\S]*event_id\s+text\s+PRIMARY KEY/i);
  });

  it('creates stripe_events with event_id PK, type NOT NULL, payload jsonb', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS public\.stripe_events/i);
    const block = sql.slice(sql.indexOf('stripe_events'));
    expect(block).toMatch(/event_id\s+text\s+PRIMARY KEY/i);
    expect(block).toMatch(/type\s+text\s+NOT NULL/i);
    expect(block).toMatch(/payload\s+jsonb\s+NOT NULL/i);
    expect(block).toMatch(/created_at\s+timestamptz/i);
  });

  it('enables RLS on both tables and creates NO policy (server-only)', () => {
    expect(sql).toMatch(/ALTER TABLE public\.stripe_idempotency ENABLE ROW LEVEL SECURITY/i);
    expect(sql).toMatch(/ALTER TABLE public\.stripe_events\s+ENABLE ROW LEVEL SECURITY/i);
    expect(sql).not.toMatch(/CREATE\s+POLICY/i);
  });

  it('revokes all client-role privileges on both tables', () => {
    for (const t of ['stripe_idempotency', 'stripe_events']) {
      expect(sql).toMatch(new RegExp(`REVOKE ALL PRIVILEGES ON public\\.${t}\\s+FROM anon`, 'i'));
      expect(sql).toMatch(new RegExp(`REVOKE ALL PRIVILEGES ON public\\.${t}\\s+FROM authenticated`, 'i'));
      expect(sql).toMatch(new RegExp(`REVOKE ALL PRIVILEGES ON public\\.${t}\\s+FROM PUBLIC`, 'i'));
    }
  });

  it('is additive/idempotent and destructive-op free', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS/i);
    expect(sql).not.toMatch(/\bDROP\s+TABLE\b/i);
    expect(sql).not.toMatch(/\bTRUNCATE\b/i);
    expect(sql).not.toMatch(/\bDELETE\s+FROM\b/i);
  });

  it('makes NO unrelated schema changes (scope guard vs legacy stripe.sql)', () => {
    expect(sql).not.toMatch(/\borders\b/i);
    expect(sql).not.toMatch(/\bproviders\b/i);
    expect(sql).not.toMatch(/\bpayouts\b/i);
    expect(sql).not.toMatch(/CREATE\s+(OR\s+REPLACE\s+)?FUNCTION/i);
    // only the two intended tables are created
    const creates = [...sql.matchAll(/CREATE TABLE IF NOT EXISTS public\.(\w+)/gi)].map((m) => m[1]).sort();
    expect(creates).toEqual(['stripe_events', 'stripe_idempotency']);
  });
});

describe('code contract still matches the migration', () => {
  it('idempotency relies on a bare INSERT (unique event_id) + duplicate/DELETE', () => {
    expect(idempotencySrc).toMatch(/INSERT INTO stripe_idempotency \(event_id\)/i);
    expect(idempotencySrc).toMatch(/DELETE FROM stripe_idempotency WHERE event_id/i);
    expect(idempotencySrc).toMatch(/23505/); // duplicate-key path is the skip signal
  });

  it('audit insert targets (event_id, type, payload) with ON CONFLICT (event_id)', () => {
    expect(handlersSrc).toMatch(/INSERT INTO stripe_events \(event_id, type, payload\)/i);
    expect(handlersSrc).toMatch(/ON CONFLICT \(event_id\) DO NOTHING/i);
  });
});
