/**
 * Canonical Stripe webhook (/api/stripe/webhook) — raw-body signature verification.
 *
 * server/index.ts applies express.json() globally and preserves the original
 * payload on req.rawBody. Stripe's constructEvent() only accepts the raw
 * string/Buffer payload, so the canonical handler must verify against
 * req.rawBody, not the parsed req.body object.
 *
 * These tests mount the real router behind the same express.json+verify
 * pipeline as production and drive signed HTTP requests through it:
 *   - a correctly signed payload must verify and be processed (fails pre-fix,
 *     where the parsed req.body object was passed to constructEvent), and
 *   - a bad/tampered signature must be rejected with 400 before any
 *     idempotency or audit work runs.
 *
 * DB-backed collaborators (idempotency, audit log, checkout processing) are
 * mocked as spies so the wiring is asserted without a database.
 */
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
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

vi.mock('../server/lib/idempotency', () => ({ withDbIdempotency }));
vi.mock('../server/lib/stripe-handlers', () => ({
  logStripeEvent,
  upsertProviderStatus: vi.fn(async () => {}),
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

const WEBHOOK_SECRET = 'whsec_test_rawbody_regression';
const stripe = new Stripe('sk_test_dummy', { apiVersion: '2025-08-27.basil' });

let server: Server;
let base: string;

beforeAll(async () => {
  vi.resetModules();
  process.env.STRIPE_MODE = 'test';
  process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
  process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
  delete process.env.STRIPE_SECRET_KEY_TEST;
  delete process.env.STRIPE_WEBHOOK_SECRET_TEST;

  const mod = await import('../server/routes/stripe/webhook');
  const app = express();
  // Mirror server/index.ts: global JSON parsing, raw payload kept on req.rawBody.
  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  app.use('/api/stripe/webhook', mod.webhookRouter);
  server = await new Promise<Server>((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

beforeEach(() => {
  withDbIdempotency.mockClear();
  logStripeEvent.mockClear();
  processCheckoutSessionCompleted.mockClear();
});

function signedPayload(eventId: string) {
  const payload = JSON.stringify({
    id: eventId,
    object: 'event',
    type: 'checkout.session.completed',
    data: { object: { id: 'cs_test_1', object: 'checkout.session' } },
  });
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });
  return { payload, signature };
}

function post(body: string, signature: string) {
  return fetch(`${base}/api/stripe/webhook`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'stripe-signature': signature },
    body,
  });
}

describe('canonical /api/stripe/webhook — raw-body signature verification', () => {
  it('accepts and processes a correctly signed payload delivered through express.json', async () => {
    const { payload, signature } = signedPayload('evt_rawbody_ok');

    const res = await post(payload, signature);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true });
    // Idempotency + audit + event handling all ran for the verified event.
    expect(withDbIdempotency).toHaveBeenCalledWith('evt_rawbody_ok', expect.any(Function));
    expect(logStripeEvent).toHaveBeenCalledTimes(1);
    expect(processCheckoutSessionCompleted).toHaveBeenCalledTimes(1);
  });

  it('rejects an invalid signature with 400 and processes nothing', async () => {
    const { payload } = signedPayload('evt_rawbody_bad_sig');

    const res = await post(payload, 't=1,v1=deadbeef');

    expect(res.status).toBe(400);
    expect(withDbIdempotency).not.toHaveBeenCalled();
    expect(logStripeEvent).not.toHaveBeenCalled();
    expect(processCheckoutSessionCompleted).not.toHaveBeenCalled();
  });

  it('rejects a payload tampered after signing with 400', async () => {
    const { payload, signature } = signedPayload('evt_rawbody_tampered');
    const tampered = payload.replace('cs_test_1', 'cs_test_evil');

    const res = await post(tampered, signature);

    expect(res.status).toBe(400);
    expect(withDbIdempotency).not.toHaveBeenCalled();
  });
});
