/**
 * Session 5 — production-safety regression tests.
 *   - Diagnostic endpoints (opsGuard) reject the public and allow admin/ops-secret.
 *   - Log redaction strips Authorization headers and sensitive body fields.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import express from 'express';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';

vi.hoisted(() => {
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://u:p@localhost:5432/test';
});

import { redactHeaders, redactBody } from '../server/middleware/loggingMiddleware';
import { registerHealthRoutes } from '../server/routes/health';

describe('Session 5 — log redaction', () => {
  it('redacts the Authorization and cookie headers', () => {
    const out = redactHeaders({
      authorization: 'Bearer super-secret-token',
      cookie: 'session=abc',
      'user-agent': 'test',
    }) as Record<string, string>;
    expect(out.authorization).toBe('[REDACTED]');
    expect(out.cookie).toBe('[REDACTED]');
    expect(out['user-agent']).toBe('test');
  });

  it('redacts sensitive body fields but keeps benign ones', () => {
    const out = redactBody({
      email: 'a@b.com',
      password: 'hunter2',
      two_factor_secret: 'TOTPSECRET',
      nested: { card: '4242424242424242', note: 'ok' },
    }) as any;
    expect(out.email).toBe('a@b.com');
    expect(out.password).toBe('[REDACTED]');
    expect(out.two_factor_secret).toBe('[REDACTED]');
    expect(out.nested.card).toBe('[REDACTED]');
    expect(out.nested.note).toBe('ok');
  });
});

describe('Session 5 — ops diagnostics guard', () => {
  let server: Server;
  let base: string;

  beforeAll(async () => {
    process.env.OPS_SECRET = 'ops-secret-value';
    const app = express();
    app.use(express.json());
    // Simulate authMiddleware populating req.user from a test header.
    app.use((req: any, _res, next) => {
      const raw = req.header('x-test-user');
      if (raw) req.user = JSON.parse(raw);
      next();
    });
    registerHealthRoutes(app);
    server = await new Promise<Server>((resolve) => {
      const s = app.listen(0, () => resolve(s));
    });
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    delete process.env.OPS_SECRET;
  });

  it('anonymous access to /api/ops/config is forbidden (403)', async () => {
    const res = await fetch(`${base}/api/ops/config`);
    expect(res.status).toBe(403);
  });

  it('non-admin access to /api/ops/config is forbidden (403)', async () => {
    const res = await fetch(`${base}/api/ops/config`, {
      headers: { 'x-test-user': JSON.stringify({ id: 'u1', is_admin: false }) },
    });
    expect(res.status).toBe(403);
  });

  it('admin access to /api/ops/config is allowed (200)', async () => {
    const res = await fetch(`${base}/api/ops/config`, {
      headers: { 'x-test-user': JSON.stringify({ id: 'u1', is_admin: true }) },
    });
    expect(res.status).toBe(200);
  });

  it('matching ops secret is allowed even without a session (200)', async () => {
    const res = await fetch(`${base}/api/ops/config`, {
      headers: { 'x-ops-secret': 'ops-secret-value' },
    });
    expect(res.status).toBe(200);
  });

  it('the public liveness endpoint stays open (200)', async () => {
    const res = await fetch(`${base}/api/health/live`);
    expect(res.status).toBe(200);
  });
});
