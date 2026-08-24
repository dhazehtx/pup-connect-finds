/**
 * Session 4 — Stripe webhook signature enforcement.
 *
 * The webhook must never process an unverified body:
 *   - missing STRIPE_WEBHOOK_SECRET => fail closed (503), never a soft 200.
 *   - present secret + bad/missing signature => 400 (rejected).
 * The router captures the secret at module load, so each scenario uses a fresh
 * module import with the appropriate env.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import express from 'express';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';

let server: Server | undefined;

async function mountWebhook(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  const mod = await import('../server/routes/webhook');
  const app = express();
  app.use(express.json());
  app.use('/api/webhook', mod.default);
  const s = await new Promise<Server>((resolve) => {
    const srv = app.listen(0, () => resolve(srv));
  });
  server = s;
  const port = (s.address() as AddressInfo).port;
  return `http://127.0.0.1:${port}`;
}

afterEach(async () => {
  if (server) {
    await new Promise<void>((resolve) => server!.close(() => resolve()));
    server = undefined;
  }
});

function postEvent(base: string, headers: Record<string, string> = {}) {
  return fetch(`${base}/api/webhook/stripe`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed', data: { object: {} } }),
  });
}

describe('Session 4 — webhook signature enforcement', () => {
  it('fails closed (503) when no webhook secret is configured', async () => {
    const base = await mountWebhook({
      STRIPE_MODE: 'test',
      STRIPE_SECRET_KEY: 'sk_test_dummy',
      STRIPE_WEBHOOK_SECRET: undefined,
      STRIPE_WEBHOOK_SECRET_TEST: undefined,
      STRIPE_WEBHOOK_SECRET_LIVE: undefined,
    });
    const res = await postEvent(base);
    expect(res.status).toBe(503);
  });

  it('rejects (400) a request with a missing/invalid signature when a secret is set', async () => {
    const base = await mountWebhook({
      STRIPE_MODE: 'test',
      STRIPE_SECRET_KEY: 'sk_test_dummy',
      STRIPE_WEBHOOK_SECRET: 'whsec_dummy_secret',
    });
    const res = await postEvent(base, { 'stripe-signature': 't=1,v1=deadbeef' });
    expect(res.status).toBe(400);
  });

  it('does not accept an unsigned event as success (never 200 without verification)', async () => {
    const base = await mountWebhook({
      STRIPE_MODE: 'test',
      STRIPE_SECRET_KEY: 'sk_test_dummy',
      STRIPE_WEBHOOK_SECRET: 'whsec_dummy_secret',
    });
    const res = await postEvent(base); // no stripe-signature header
    expect(res.status).not.toBe(200);
  });
});
