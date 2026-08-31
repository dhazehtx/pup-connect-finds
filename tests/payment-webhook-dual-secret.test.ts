/**
 * Dual Stripe webhook signing secrets — the canonical router accepts a valid
 * signature from EITHER the platform secret (STRIPE_WEBHOOK_SECRET) or the
 * optional Connect-destination secret (STRIPE_CONNECT_WEBHOOK_SECRET), never an
 * unsigned/tampered payload. The Connect secret is additive: with it absent the
 * platform webhook behaves exactly as before (production currently has only the
 * platform secret configured).
 *
 * Mirrors the raw-body harness of stripe-canonical-webhook-rawbody.test.ts:
 * the REAL router mounted behind the production express.json+rawBody pipeline,
 * DB collaborators mocked as spies.
 */
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import express from 'express';
import Stripe from 'stripe';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';

const withDbIdempotency = vi.hoisted(() =>
  vi.fn(async (_eventId: string, handler: () => Promise<void>) => {
    await handler();
  })
);
const logStripeEvent = vi.hoisted(() => vi.fn(async () => {}));
const processCheckoutSessionCompleted = vi.hoisted(() => vi.fn(async () => {}));
const upsertProviderStatus = vi.hoisted(() => vi.fn(async () => {}));

vi.mock('../server/lib/idempotency', () => ({ withDbIdempotency }));
vi.mock('../server/lib/stripe-handlers', () => ({
  logStripeEvent,
  upsertProviderStatus,
  handleTransferResult: vi.fn(async () => {}),
  handleRefund: vi.fn(async () => {}),
}));
vi.mock('../server/lib/checkoutSessionWebhook', () => ({ processCheckoutSessionCompleted }));
vi.mock('../server/lib/badges', () => ({ ensureVerifiedBadge: vi.fn(async () => {}) }));
vi.mock('@neondatabase/serverless', () => ({
  Pool: class {
    query = vi.fn(async () => ({ rows: [], rowCount: 0 }));
  },
}));

const PLATFORM_SECRET = 'whsec_test_platform_dual';
const CONNECT_SECRET = 'whsec_test_connect_dual';
const stripe = new Stripe('sk_test_dummy', { apiVersion: '2025-08-27.basil' });

let server: Server | null = null;
let base = '';

async function startServer(connectSecret: string | undefined) {
  vi.resetModules();
  process.env.STRIPE_MODE = 'test';
  process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
  process.env.STRIPE_WEBHOOK_SECRET = PLATFORM_SECRET;
  delete process.env.STRIPE_SECRET_KEY_TEST;
  delete process.env.STRIPE_WEBHOOK_SECRET_TEST;
  delete process.env.STRIPE_CONNECT_WEBHOOK_SECRET_TEST;
  if (connectSecret === undefined) delete process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
  else process.env.STRIPE_CONNECT_WEBHOOK_SECRET = connectSecret;

  const mod = await import('../server/routes/stripe/webhook');
  const app = express();
  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  // Same router on the canonical path and its aliases (as in server/routes.ts).
  app.use('/api/webhooks/stripe', mod.webhookRouter);
  app.use('/api/stripe/webhook', mod.webhookRouter);
  server = await new Promise<Server>((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

async function stopServer() {
  if (server) await new Promise<void>((resolve) => server!.close(() => resolve()));
  server = null;
}

function sign(payload: string, secret: string) {
  return stripe.webhooks.generateTestHeaderString({ payload, secret });
}

function checkoutPayload(eventId: string) {
  return JSON.stringify({
    id: eventId,
    object: 'event',
    type: 'checkout.session.completed',
    data: { object: { id: 'cs_dual_1', object: 'checkout.session' } },
  });
}

function accountUpdatedPayload(eventId: string) {
  return JSON.stringify({
    id: eventId,
    object: 'event',
    type: 'account.updated',
    account: 'acct_connected_1',
    data: {
      object: {
        id: 'acct_connected_1',
        object: 'account',
        charges_enabled: true,
        payouts_enabled: true,
        requirements: { currently_due: [] },
      },
    },
  });
}

function post(path: string, body: string, signature?: string) {
  return fetch(`${base}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(signature ? { 'stripe-signature': signature } : {}),
    },
    body,
  });
}

beforeEach(() => {
  withDbIdempotency.mockClear();
  logStripeEvent.mockClear();
  processCheckoutSessionCompleted.mockClear();
  upsertProviderStatus.mockClear();
});

afterEach(async () => {
  await stopServer();
});

describe('both secrets configured', () => {
  it('accepts a PLATFORM-secret-signed event and processes it', async () => {
    await startServer(CONNECT_SECRET);
    const payload = checkoutPayload('evt_dual_platform_ok');
    const res = await post('/api/stripe/webhook', payload, sign(payload, PLATFORM_SECRET));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true });
    expect(withDbIdempotency).toHaveBeenCalledWith('evt_dual_platform_ok', expect.any(Function));
    expect(processCheckoutSessionCompleted).toHaveBeenCalledTimes(1);
  });

  it('accepts a CONNECT-secret-signed account.updated on /api/webhooks/stripe and processes it', async () => {
    await startServer(CONNECT_SECRET);
    const payload = accountUpdatedPayload('evt_dual_connect_ok');
    const res = await post('/api/webhooks/stripe', payload, sign(payload, CONNECT_SECRET));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true });
    expect(withDbIdempotency).toHaveBeenCalledWith('evt_dual_connect_ok', expect.any(Function));
    expect(upsertProviderStatus).toHaveBeenCalledWith(
      expect.objectContaining({ stripeAccountId: 'acct_connected_1', chargesEnabled: true, payoutsEnabled: true })
    );
  });

  it('rejects a signature from an UNKNOWN secret with 400 and processes nothing', async () => {
    await startServer(CONNECT_SECRET);
    const payload = checkoutPayload('evt_dual_unknown_secret');
    const res = await post('/api/stripe/webhook', payload, sign(payload, 'whsec_attacker'));
    expect(res.status).toBe(400);
    expect(withDbIdempotency).not.toHaveBeenCalled();
    expect(processCheckoutSessionCompleted).not.toHaveBeenCalled();
  });

  it('rejects an unsigned payload with 400', async () => {
    await startServer(CONNECT_SECRET);
    const res = await post('/api/stripe/webhook', checkoutPayload('evt_dual_unsigned'));
    expect(res.status).toBe(400);
    expect(withDbIdempotency).not.toHaveBeenCalled();
  });

  it('rejects a payload tampered after signing (either secret) with 400', async () => {
    await startServer(CONNECT_SECRET);
    const payload = accountUpdatedPayload('evt_dual_tampered');
    const tampered = payload.replace('acct_connected_1', 'acct_evil');
    const res = await post('/api/webhooks/stripe', tampered, sign(payload, CONNECT_SECRET));
    expect(res.status).toBe(400);
    expect(upsertProviderStatus).not.toHaveBeenCalled();
  });
});

describe('connect secret ABSENT (current production posture) — fail-safe', () => {
  it('platform-secret-signed events still verify and process exactly as before', async () => {
    await startServer(undefined);
    const payload = checkoutPayload('evt_dual_absent_platform');
    const res = await post('/api/stripe/webhook', payload, sign(payload, PLATFORM_SECRET));
    expect(res.status).toBe(200);
    expect(processCheckoutSessionCompleted).toHaveBeenCalledTimes(1);
  });

  it('connect-secret-signed events are rejected with 400 (never accepted unverified)', async () => {
    await startServer(undefined);
    const payload = accountUpdatedPayload('evt_dual_absent_connect');
    const res = await post('/api/webhooks/stripe', payload, sign(payload, CONNECT_SECRET));
    expect(res.status).toBe(400);
    expect(upsertProviderStatus).not.toHaveBeenCalled();
  });
});
