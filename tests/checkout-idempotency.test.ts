/**
 * Revenue-safety regression: processCheckoutSessionCompleted (the single source of
 * truth for Stripe checkout completion) must fulfil an order exactly ONCE. Stripe
 * retries webhook deliveries, so a duplicate `checkout.session.completed` for an
 * already-paid order must be a no-op — no second inventory decrement, no re-pay.
 * DB/storage are mocked; deterministic, no network.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.hoisted(() => {
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://u:p@localhost:5432/test';
});

// order state the mocked storage returns; tests mutate it.
const state = vi.hoisted(() => ({
  order: { id: 'order_1', status: 'pending', user_id: 'user_1', amount_total: '20.00' } as any,
  updateCalls: [] as any[],
  decrementCalls: [] as any[],
}));

vi.mock('../server/storage', () => ({
  storage: {
    getOrder: vi.fn(async (id: string) => (id === state.order.id ? state.order : undefined)),
    updateOrder: vi.fn(async (id: string, patch: any) => {
      state.updateCalls.push({ id, patch });
      state.order = { ...state.order, ...patch };
      return state.order;
    }),
    getOrderItems: vi.fn(async () => [{ product_id: 'prod_1', qty: 2 }]),
    decrementProductInventory: vi.fn(async (productId: string, qty: number) => {
      state.decrementCalls.push({ productId, qty });
    }),
  },
}));

vi.mock('../server/db', () => {
  const builder: any = {
    select: () => builder, from: () => builder, where: () => builder, limit: () => Promise.resolve([]),
    update: () => builder, set: () => builder, insert: () => builder, values: () => Promise.resolve([]),
  };
  return { db: builder };
});

vi.mock('../server/lib/stripe-handlers', () => ({ markBookingPaid: vi.fn(async () => {}) }));

import { processCheckoutSessionCompleted } from '../server/lib/checkoutSessionWebhook';

const sessionFor = (orderId: string) => ({
  id: 'cs_test_123',
  mode: 'payment',
  payment_intent: 'pi_test_123',
  client_reference_id: 'user_1',
  metadata: { order_id: orderId, user_id: 'user_1' },
}) as any;

describe('processCheckoutSessionCompleted — idempotent order fulfilment', () => {
  beforeEach(() => {
    state.order = { id: 'order_1', status: 'pending', user_id: 'user_1', amount_total: '20.00' };
    state.updateCalls = [];
    state.decrementCalls = [];
  });

  it('first delivery marks the pending order paid and decrements inventory once', async () => {
    await processCheckoutSessionCompleted(sessionFor('order_1'));
    expect(state.updateCalls).toHaveLength(1);
    expect(state.updateCalls[0].patch.status).toBe('paid');
    expect(state.decrementCalls).toEqual([{ productId: 'prod_1', qty: 2 }]);
  });

  it('duplicate delivery for an already-paid order is a no-op (no double fulfilment)', async () => {
    await processCheckoutSessionCompleted(sessionFor('order_1')); // pending -> paid
    state.updateCalls = [];
    state.decrementCalls = [];
    await processCheckoutSessionCompleted(sessionFor('order_1')); // now paid -> skip
    expect(state.updateCalls).toHaveLength(0);
    expect(state.decrementCalls).toHaveLength(0);
  });

  it('unknown order id does not update or decrement anything', async () => {
    await processCheckoutSessionCompleted(sessionFor('order_missing'));
    expect(state.updateCalls).toHaveLength(0);
    expect(state.decrementCalls).toHaveLength(0);
  });
});
