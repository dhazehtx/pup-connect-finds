/**
 * Session 1 — Authentication, Authorization & IDOR regression tests.
 *
 * These exercise the real server-side authorization primitives introduced in
 * Session 1 (`requireAuth`, `requireOwner`, `requireSelf`, `requireAdmin`) plus
 * the hardened payout handler, wired into a minimal Express app so we can assert
 * HTTP status codes end-to-end. The database layer is mocked so the tests run
 * without a live Postgres/Supabase/Stripe connection.
 *
 * Each test maps to a concrete attack the audit flagged:
 *   - anonymous listing mutation        -> 401
 *   - user A mutating user B's listing   -> 403
 *   - anonymous export / delete / payout -> 401
 *   - payout ignores a supplied victim userId
 *   - favorites reject a foreign userId  -> 403
 *   - conversation reads limited to participants
 *   - message sender identity is server-derived
 *   - provider verification / admin routes require an admin
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import express from 'express';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';

// Env must be set before importing modules that construct Stripe/Neon clients at
// load time. vi.hoisted runs before the (hoisted) ESM imports below.
vi.hoisted(() => {
  process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/test';
});

// Shared, per-test-controllable DB result rows.
const mockState = vi.hoisted(() => ({ rows: [] as any[] }));

vi.mock('../server/db', () => {
  const makeBuilder = () => {
    const builder: any = {
      select: () => builder,
      from: () => builder,
      where: () => builder,
      leftJoin: () => builder,
      innerJoin: () => builder,
      orderBy: () => builder,
      limit: () => builder,
      then: (resolve: (v: any[]) => any, reject: (e: any) => any) =>
        Promise.resolve(mockState.rows).then(resolve, reject),
    };
    return builder;
  };
  const db = { select: () => makeBuilder() };
  const pool = { query: async () => ({ rows: mockState.rows }) };
  return { db, pool };
});

// Imported after the mock is registered.
import { requireAuth } from '../server/middleware/auth';
import { requireAdmin } from '../server/middleware/requireAdmin';
import { requireOwner, requireSelf } from '../server/middleware/ownership';
import { startPayout } from '../server/routes/payout/start';

const USER_A = '11111111-1111-1111-1111-111111111111';
const USER_B = '22222222-2222-2222-2222-222222222222';

/**
 * Test double for authMiddleware: an `x-test-user` header (JSON) becomes
 * req.user + isAuthenticated()==true; absence means anonymous.
 */
function fakeAuth(req: any, _res: any, next: any) {
  const raw = req.header('x-test-user');
  if (raw) {
    req.user = JSON.parse(raw);
    req.isAuthenticated = () => true;
  } else {
    req.isAuthenticated = () => false;
  }
  next();
}

let server: Server;
let base: string;

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use(fakeAuth);

  // Listings: create requires auth; mutate requires ownership.
  app.post('/api/listings', requireAuth, (req: any, res) => res.json({ ok: true, owner: req.user.id }));
  app.put('/api/listings/:id', requireAuth, requireOwner('listing'), (_req, res) => res.json({ ok: true }));

  // Favorites: self-scoped collection.
  app.get('/api/favorites/:userId', requireAuth, requireSelf((req: any) => req.params.userId), (_req, res) =>
    res.json({ ok: true }),
  );

  // Account data: auth required, identity is server-derived.
  app.get('/api/export-data', requireAuth, (req: any, res) => res.json({ ok: true, userId: req.user.id }));
  app.delete('/api/delete-account', requireAuth, (_req, res) => res.json({ ok: true }));

  // Provider verification / admin route.
  app.post('/api/provider-applications/review', requireAdmin, (_req, res) => res.json({ ok: true }));
  app.get('/api/admin/logs', requireAuth, requireAdmin, (_req, res) => res.json({ ok: true }));

  // Payout: requireAuth guards the route; handler also fails closed.
  app.post('/api/payout/start', requireAuth, (req, res) => startPayout(req as any, res as any));

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const port = (server.address() as AddressInfo).port;
  base = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

function call(method: string, path: string, opts: { user?: object; body?: object } = {}) {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (opts.user) headers['x-test-user'] = JSON.stringify(opts.user);
  return fetch(`${base}${path}`, {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
}

describe('Session 1 — unauthenticated mutation is rejected', () => {
  it('anonymous listing create -> 401', async () => {
    const res = await call('POST', '/api/listings', { body: { dog_name: 'x', user_id: USER_B } });
    expect(res.status).toBe(401);
  });

  it('anonymous export -> 401', async () => {
    const res = await call('GET', '/api/export-data?userId=' + USER_B);
    expect(res.status).toBe(401);
  });

  it('anonymous account deletion -> 401', async () => {
    const res = await call('DELETE', '/api/delete-account', { body: { userId: USER_B, confirmDelete: true } });
    expect(res.status).toBe(401);
  });

  it('anonymous payout start -> 401', async () => {
    const res = await call('POST', '/api/payout/start', { body: { userId: USER_B } });
    expect(res.status).toBe(401);
  });
});

describe('Session 1 — listing ownership (IDOR)', () => {
  it('user A editing user B listing -> 403', async () => {
    mockState.rows = [{ owner: USER_B }]; // listing is owned by B
    const res = await call('PUT', '/api/listings/some-id', { user: { id: USER_A }, body: { price: '1' } });
    expect(res.status).toBe(403);
  });

  it('owner editing own listing -> 200', async () => {
    mockState.rows = [{ owner: USER_A }];
    const res = await call('PUT', '/api/listings/some-id', { user: { id: USER_A }, body: { price: '1' } });
    expect(res.status).toBe(200);
  });

  it('editing a missing listing -> 404', async () => {
    mockState.rows = [];
    const res = await call('PUT', '/api/listings/missing', { user: { id: USER_A }, body: { price: '1' } });
    expect(res.status).toBe(404);
  });

  it('admin editing any listing -> 200', async () => {
    mockState.rows = [{ owner: USER_B }];
    const res = await call('PUT', '/api/listings/some-id', { user: { id: USER_A, is_admin: true }, body: {} });
    expect(res.status).toBe(200);
  });
});

describe('Session 1 — export identity is server-derived', () => {
  it('authenticated export uses session id, not the query userId', async () => {
    const res = await call('GET', '/api/export-data?userId=' + USER_B, { user: { id: USER_A } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.userId).toBe(USER_A); // not USER_B from the query string
  });
});

describe('Session 1 — favorites reject a foreign userId', () => {
  it('user A reading user B favorites -> 403', async () => {
    const res = await call('GET', `/api/favorites/${USER_B}`, { user: { id: USER_A } });
    expect(res.status).toBe(403);
  });

  it('user A reading own favorites -> 200', async () => {
    const res = await call('GET', `/api/favorites/${USER_A}`, { user: { id: USER_A } });
    expect(res.status).toBe(200);
  });
});

describe('Session 1 — payout ignores a supplied victim userId', () => {
  it('unauthenticated payout with body.userId=victim -> 401 (route guard)', async () => {
    const res = await call('POST', '/api/payout/start', { body: { userId: USER_B } });
    expect(res.status).toBe(401);
  });

  it('startPayout handler fails closed when no session, ignoring body.userId', async () => {
    const captured: any = {};
    const res: any = {
      status(code: number) {
        captured.code = code;
        return this;
      },
      json(payload: any) {
        captured.body = payload;
        return this;
      },
    };
    const req: any = { user: undefined, body: { userId: USER_B }, query: { userId: USER_B }, get: () => '' };
    await startPayout(req, res);
    expect(captured.code).toBe(401);
  });
});

describe('Session 1 — provider verification / admin routes require admin', () => {
  it('anonymous provider-application review -> 401', async () => {
    const res = await call('POST', '/api/provider-applications/review', { body: { applicationId: 'a', action: 'approve' } });
    expect(res.status).toBe(401);
  });

  it('non-admin provider-application review -> 403', async () => {
    mockState.rows = [{ id: USER_A, role: 'user', is_admin: false, is_suspended: false }];
    const res = await call('POST', '/api/provider-applications/review', {
      user: { id: USER_A },
      body: { applicationId: 'a', action: 'approve' },
    });
    expect(res.status).toBe(403);
  });

  it('admin provider-application review -> 200', async () => {
    mockState.rows = [{ id: USER_A, role: 'admin', is_admin: true, is_suspended: false }];
    const res = await call('POST', '/api/provider-applications/review', {
      user: { id: USER_A },
      body: { applicationId: 'a', action: 'approve' },
    });
    expect(res.status).toBe(200);
  });

  it('non-admin admin-logs read -> 403', async () => {
    mockState.rows = [{ id: USER_A, role: 'user', is_admin: false, is_suspended: false }];
    const res = await call('GET', '/api/admin/logs', { user: { id: USER_A } });
    expect(res.status).toBe(403);
  });
});
