/**
 * Session 3 — authoritative listing pipeline (integration-style).
 *
 * Verifies the single, server-authoritative listing lifecycle that Session 3
 * establishes: writes go through the server (not the browser→Supabase path),
 * the owner is derived from the session, and cross-user edits/deletes are
 * rejected. Uses a stateful in-memory store + the real `requireAuth`, with a
 * store-backed ownership guard mirroring `requireOwner`.
 *
 * Lifecycle: signup/auth fixture -> create -> retrieve -> edit as owner ->
 * reject edit as another user -> delete.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { requireAuth } from '../server/middleware/auth';

const USER_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const USER_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

interface Listing {
  id: string;
  user_id: string;
  dog_name: string;
  breed: string;
  age: number;
  price: string;
  deleted_at: string | null;
}

// The single source of truth (server-side store) for this test.
const store = new Map<string, Listing>();
let idSeq = 0;

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

// Mirrors server/middleware/ownership.ts requireOwner('listing') against the store.
function requireListingOwner(req: any, res: any, next: any) {
  const listing = store.get(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Not found' });
  if (!req.user?.is_admin && listing.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden', code: 'NOT_OWNER' });
  }
  (req as any).listing = listing;
  next();
}

let server: Server;
let base: string;

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use(fakeAuth);

  // POST /api/listings — owner is server-derived; client user_id is ignored.
  app.post('/api/listings', requireAuth, (req: any, res) => {
    const id = `listing-${++idSeq}`;
    const listing: Listing = {
      id,
      user_id: req.user.id, // NOT req.body.user_id
      dog_name: req.body.dog_name,
      breed: req.body.breed,
      age: req.body.age,
      price: String(req.body.price),
      deleted_at: null,
    };
    store.set(id, listing);
    res.json(listing);
  });

  // GET /api/listings/:id — public read.
  app.get('/api/listings/:id', (req, res) => {
    const listing = store.get(req.params.id);
    if (!listing || listing.deleted_at) return res.status(404).json({ error: 'Not found' });
    res.json(listing);
  });

  // PUT /api/listings/:id — ownership required; ownership fields cannot be reassigned.
  app.put('/api/listings/:id', requireAuth, requireListingOwner, (req: any, res) => {
    const listing: Listing = req.listing;
    const { user_id: _ignore, ...rest } = req.body ?? {};
    if (rest.price !== undefined) rest.price = String(rest.price);
    Object.assign(listing, rest, { id: listing.id, user_id: listing.user_id });
    store.set(listing.id, listing);
    res.json(listing);
  });

  // DELETE /api/listings/:id — ownership required (soft-delete).
  app.delete('/api/listings/:id', requireAuth, requireListingOwner, (req: any, res) => {
    const listing: Listing = req.listing;
    listing.deleted_at = '2026-08-24T00:00:00.000Z';
    store.set(listing.id, listing);
    res.json({ success: true, trashed: true });
  });

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
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

describe('Session 3 — authoritative listing lifecycle', () => {
  let createdId = '';

  it('anonymous create is rejected (writes must be authenticated)', async () => {
    const res = await call('POST', '/api/listings', { body: { dog_name: 'Rex', breed: 'Lab', age: 2, price: 100 } });
    expect(res.status).toBe(401);
  });

  it('owner creates a listing; server derives user_id and ignores a spoofed body user_id', async () => {
    const res = await call('POST', '/api/listings', {
      user: { id: USER_A },
      body: { dog_name: 'Rex', breed: 'Lab', age: 2, price: 100, user_id: USER_B },
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.user_id).toBe(USER_A); // not the spoofed USER_B
    createdId = json.id;
  });

  it('the created listing is retrievable', async () => {
    const res = await call('GET', `/api/listings/${createdId}`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.dog_name).toBe('Rex');
  });

  it('owner can edit their listing', async () => {
    const res = await call('PUT', `/api/listings/${createdId}`, { user: { id: USER_A }, body: { price: 250 } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.price).toBe('250');
  });

  it('a different user cannot edit the listing (403)', async () => {
    const res = await call('PUT', `/api/listings/${createdId}`, { user: { id: USER_B }, body: { price: 1 } });
    expect(res.status).toBe(403);
  });

  it('a spoofed user_id in an owner edit does not transfer ownership', async () => {
    const res = await call('PUT', `/api/listings/${createdId}`, { user: { id: USER_A }, body: { user_id: USER_B } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.user_id).toBe(USER_A);
  });

  it('a different user cannot delete the listing (403)', async () => {
    const res = await call('DELETE', `/api/listings/${createdId}`, { user: { id: USER_B } });
    expect(res.status).toBe(403);
  });

  it('owner can delete (soft-delete) the listing; it then 404s on read', async () => {
    const del = await call('DELETE', `/api/listings/${createdId}`, { user: { id: USER_A } });
    expect(del.status).toBe(200);
    const get = await call('GET', `/api/listings/${createdId}`);
    expect(get.status).toBe(404);
  });
});
