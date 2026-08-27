/**
 * Follow-up hardening regressions (post-cutover, local candidate). Source-guard
 * style — pins the P1/P2 fixes so they cannot silently regress.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');

describe('P1 — Stripe webhook consolidation: the legacy handler is now idempotent', () => {
  const wh = read('server/routes/webhook.ts');
  it('delegates checkout.session.completed to the canonical idempotent processor', () => {
    expect(wh).toMatch(/withDbIdempotency\(event\.id/);
    expect(wh).toMatch(/processCheckoutSessionCompleted\(session\)/);
    expect(wh).toMatch(/logStripeEvent\(event\)/);
  });
  it('no longer creates an order unconditionally (double-order hazard removed)', () => {
    expect(wh).not.toMatch(/storage\.createOrder\(/);
    expect(wh).not.toMatch(/storage\.decrementProductInventory\(/);
  });
  it('still verifies the signature and fails closed on a missing secret', () => {
    expect(wh).toMatch(/stripe\.webhooks\.constructEvent/);
    expect(wh).toMatch(/rawBody \|\| req\.body/);
    expect(wh).toMatch(/status\(503\)/);
  });
});

describe('P2 — unknown routes render a real 404 (not a blank page)', () => {
  const app = read('client/src/App.tsx');
  it('registers a catch-all route to NotFound', () => {
    expect(app).toMatch(/const LazyNotFound = lazy\(\(\) => import\('\.\/pages\/NotFound'\)\)/);
    expect(app).toMatch(/<Route path="\*" element=/);
    expect(app).toMatch(/<LazyNotFound \/>/);
  });
});

describe('P2 — /explore sets an accurate document title', () => {
  const router = read('client/src/pages/ExploreRouter.tsx');
  it('sets document.title on mount', () => {
    expect(router).toMatch(/document\.title = 'Explore — PAWS'/);
  });
});

describe('P1 — desktop messaging layout: dvh height + composer clears the mobile nav', () => {
  const thread = read('client/src/components/messaging/MessageThread.tsx');
  it('uses 100dvh (not 100vh) for the full-height chat containers', () => {
    expect(thread).not.toMatch(/flex flex-col h-screen/);
    expect(thread).toMatch(/flex flex-col h-\[100dvh\]/);
  });
  it('the composer has bottom clearance for the fixed mobile bottom nav (md:pb-3)', () => {
    expect(thread).toMatch(/pb-\[calc\(0\.75rem\+4rem\+env\(safe-area-inset-bottom,0px\)\)\] md:pb-3/);
  });
});
