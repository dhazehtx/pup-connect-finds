/**
 * Post-checkpoint regression tests for the corrected migration + its app changes.
 *
 *  - The subscription-analytics data path is admin-authorized (Express), not a
 *    broad anon Supabase read.
 *  - The corrected migration is forward-only, contains NO blocking trigger, and
 *    enforces privilege protection via column-level GRANT/REVOKE (so trusted
 *    Drizzle backend writes — provider approval, ban/unban, 2FA — keep working).
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import express from 'express';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { readFileSync } from 'node:fs';
import path from 'node:path';

vi.hoisted(() => {
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://u:p@localhost:5432/test';
});

// Fake service-role client: chainable query resolving to sample analytics rows.
vi.mock('../server/lib/supabaseAdmin', () => {
  const rows = [
    { date: '2026-08-01', new_subscriptions: 3, cancelled_subscriptions: 1, upgrades: 0, downgrades: 0, total_revenue: '100', mrr: '100', tier_breakdown: {} },
  ];
  const builder: any = {
    select: () => builder,
    gte: () => builder,
    lte: () => builder,
    order: () => Promise.resolve({ data: rows, error: null }),
  };
  return { supabaseAdmin: { from: () => builder } };
});

import analyticsRouter from '../server/routes/analytics';

let server: Server;
let base: string;

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  // Pre-set req.user (the real authMiddleware inside the router passes through
  // when no Bearer token is present, and never clears an already-set req.user).
  app.use((req: any, _res, next) => {
    const raw = req.header('x-test-user');
    if (raw) req.user = JSON.parse(raw);
    next();
  });
  app.use('/api/admin/analytics', analyticsRouter);
  server = await new Promise<Server>((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

function call(pathname: string, user?: object) {
  const headers: Record<string, string> = {};
  if (user) headers['x-test-user'] = JSON.stringify(user);
  return fetch(`${base}${pathname}`, { headers });
}

describe('checkpoint — subscription analytics is admin-authorized (server path)', () => {
  it('anonymous (no user) is forbidden', async () => {
    const res = await call('/api/admin/analytics/subscriptions?days=30');
    expect(res.status).toBe(403);
  });

  it('non-admin is forbidden', async () => {
    const res = await call('/api/admin/analytics/subscriptions?days=30', { id: 'u1', is_admin: false });
    expect(res.status).toBe(403);
  });

  it('admin gets the analytics data', async () => {
    const res = await call('/api/admin/analytics/subscriptions?days=30', { id: 'u1', is_admin: true });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data[0].new_subscriptions).toBe(3);
  });
});

describe('checkpoint — corrected migration is safe & trigger-free', () => {
  const sql = readFileSync(
    path.resolve(__dirname, '../supabase/migrations/20260824000000_rls_storage_privacy_hardening.sql'),
    'utf8',
  );

  it('does NOT create a blocking trigger (which would break Drizzle backend writes)', () => {
    expect(sql).not.toMatch(/CREATE\s+TRIGGER/i);
    // The trigger function must not be (re)created; a comment mentioning why it
    // was removed is fine, so we forbid only the CREATE FUNCTION statement.
    expect(sql).not.toMatch(/CREATE\s+(OR\s+REPLACE\s+)?FUNCTION\s+public\.prevent_profile_privilege_escalation/i);
  });

  it('enforces privilege protection via column-level REVOKE', () => {
    expect(sql).toMatch(/REVOKE UPDATE \(%I\)/i);
    expect(sql).toMatch(/REVOKE SELECT \(%I\)/i);
    // privilege + PII columns are in the guarded arrays
    for (const col of ['is_admin', 'verified', 'role', 'is_suspended']) {
      expect(sql).toContain(`'${col}'`);
    }
    for (const col of ['email', 'phone', 'two_factor_secret', 'backup_codes']) {
      expect(sql).toContain(`'${col}'`);
    }
  });

  it('keeps public marketplace profile fields readable (not revoked)', () => {
    // These must NOT appear in the select_guard REVOKE array.
    const guardBlock = sql.slice(sql.indexOf('select_guard'), sql.indexOf('BEGIN', sql.indexOf('select_guard')));
    for (const pub of ['username', 'full_name', 'avatar_url', 'rating', 'total_reviews']) {
      expect(guardBlock).not.toContain(`'${pub}'`);
    }
  });

  it('is forward-only and deletes no data', () => {
    expect(sql).not.toMatch(/\bDROP\s+TABLE\b/i);
    expect(sql).not.toMatch(/\bDROP\s+COLUMN\b/i);
    expect(sql).not.toMatch(/\bTRUNCATE\b/i);
    expect(sql).not.toMatch(/\bDELETE\s+FROM\b/i);
    expect(sql).not.toMatch(/\bDROP\s+SCHEMA\b/i);
  });

  it('makes both sensitive storage buckets private', () => {
    expect(sql).toMatch(/UPDATE storage\.buckets SET public = false WHERE id = 'provider-id-docs'/);
    expect(sql).toMatch(/UPDATE storage\.buckets SET public = false WHERE id = 'message-attachments'/);
  });
});
