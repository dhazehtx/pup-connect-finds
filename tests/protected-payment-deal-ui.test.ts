/**
 * Protected Payment V1 deal-management UI — My Deals + role-aware Deal Detail.
 *
 * Behavioral tests over the pure presentation module (action gating per
 * role/state) plus wiring pins: auth-gated routes, existing-API-only mutations,
 * balance-payment reuse, no client DB access, no client-side authoritative
 * amount/commission, and no admin controls for normal users.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  dealActions,
  dealProgressIndex,
  DEAL_STATUS_LABELS,
  formatDealAmount,
} from '../client/src/lib/dealPresentation';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');
const app = read('client/src/App.tsx');
const myDeals = read('client/src/pages/MyDeals.tsx');
const detail = read('client/src/pages/DealDetail.tsx');
const menu = read('client/src/components/layout/AccountMenu.tsx');

describe('reachability + auth gating', () => {
  it('authenticated users reach My Deals at /deals (RequireAuth) via the account menu', () => {
    const route = app.slice(app.indexOf('path="/deals"'), app.indexOf('path="/deals"') + 400);
    expect(route).toMatch(/RequireAuth/);
    expect(route).toMatch(/LazyMyDeals/);
    expect(menu).toMatch(/\{ to: '\/deals', label: 'Protected Payments', icon: ShieldCheck \}/);
  });
  it('deal selection reaches the auth-gated Deal Detail at /deals/:dealId', () => {
    expect(myDeals).toMatch(/to=\{`\/deals\/\$\{d\.id\}`\}/);
    const route = app.slice(app.indexOf('path="/deals/:dealId"'), app.indexOf('path="/deals/:dealId"') + 400);
    expect(route).toMatch(/RequireAuth/);
    expect(route).toMatch(/LazyDealDetail/);
  });
  it('unauthenticated access fails safely (both routes wrapped in RequireAuth)', () => {
    for (const p of ['path="/deals"', 'path="/deals/:dealId"']) {
      expect(app.slice(app.indexOf(p), app.indexOf(p) + 200)).toMatch(/RequireAuth/);
    }
  });
  it('empty, loading, and error states render safely in My Deals', () => {
    expect(myDeals).toMatch(/No protected payments yet/);
    expect(myDeals).toMatch(/animate-pulse/);
    expect(myDeals).toMatch(/role="alert"/);
  });
});

describe('role-aware action gating (behavioral, mirrors the server state machine)', () => {
  it('buyer sees pay-balance ONLY in DEPOSIT_PAID', () => {
    expect(dealActions('DEPOSIT_PAID', 'buyer')).toEqual(['pay_balance']);
    for (const s of ['RESERVED', 'PAID_IN_FULL', 'DELIVERED_PENDING_CONFIRM', 'RELEASED', 'DISPUTED']) {
      expect(dealActions(s, 'buyer')).not.toContain('pay_balance');
    }
  });
  it('buyer confirm-received appears ONLY in DELIVERED_PENDING_CONFIRM', () => {
    expect(dealActions('DELIVERED_PENDING_CONFIRM', 'buyer')).toContain('confirm_received');
    for (const s of ['RESERVED', 'DEPOSIT_PAID', 'PAID_IN_FULL', 'DELIVERED_CONFIRMED', 'RELEASED']) {
      expect(dealActions(s, 'buyer')).not.toContain('confirm_received');
    }
  });
  it('buyer dispute availability mirrors the server validStatuses exactly', () => {
    for (const s of ['PAID_IN_FULL', 'DELIVERED_PENDING_CONFIRM', 'DELIVERED_CONFIRMED']) {
      expect(dealActions(s, 'buyer')).toContain('open_dispute');
    }
    for (const s of ['RESERVED', 'DEPOSIT_PAID', 'DISPUTED', 'RELEASED', 'REFUNDED', 'CANCELED']) {
      expect(dealActions(s, 'buyer')).not.toContain('open_dispute');
    }
  });
  it('seller sees handoff + mark-delivered ONLY in PAID_IN_FULL', () => {
    expect(dealActions('PAID_IN_FULL', 'seller')).toEqual(['generate_handoff_code', 'mark_delivered']);
    for (const s of ['RESERVED', 'DEPOSIT_PAID', 'DELIVERED_PENDING_CONFIRM', 'DELIVERED_CONFIRMED', 'RELEASED', 'DISPUTED']) {
      expect(dealActions(s, 'seller')).toEqual([]);
    }
  });
  it('buyer NEVER sees seller actions; seller NEVER sees buyer actions — in any state', () => {
    const states = Object.keys(DEAL_STATUS_LABELS);
    for (const s of states) {
      const buyer = dealActions(s, 'buyer');
      expect(buyer).not.toContain('generate_handoff_code');
      expect(buyer).not.toContain('mark_delivered');
      const seller = dealActions(s, 'seller');
      expect(seller).not.toContain('pay_balance');
      expect(seller).not.toContain('confirm_received');
      expect(seller).not.toContain('open_dispute');
    }
  });
  it('no admin actions exist anywhere in the user-facing surfaces', () => {
    for (const src of [detail, myDeals]) {
      expect(src).not.toMatch(/\/refund|\/resolve|\/extend|\/cancel|is_admin|requireAdmin/);
    }
  });
  it('terminal/dispute states offer no transitions and progress renders sanely', () => {
    for (const s of ['RELEASED', 'REFUNDED', 'CANCELED', 'EXPIRED', 'DISPUTED']) {
      expect(dealActions(s, 'buyer')).not.toContain('pay_balance');
      expect(dealActions(s, 'seller')).toEqual([]);
    }
    expect(dealProgressIndex('RELEASED')).toBe(5);
    expect(dealProgressIndex('DISPUTED')).toBe(-1);
  });
});

describe('mutations use ONLY the existing authenticated Deals API', () => {
  it('balance payment reuses the existing /deals/pay Elements leg (no duplicated payment logic)', () => {
    expect(detail).toMatch(/navigate\(`\/deals\/pay\?dealId=\$\{deal\.id\}`\)/);
    expect(detail).not.toMatch(/confirmPayment|loadStripe|clientSecret/);
  });
  it('confirm-received calls the intended API', () => {
    expect(detail).toMatch(/apiRequest\(`\/api\/deals\/\$\{deal\.id\}\/confirm-received`, \{ method: 'POST' \}\)/);
  });
  it('dispute calls the intended API with a required reason', () => {
    expect(detail).toMatch(/\/api\/deals\/\$\{deal\.id\}\/dispute/);
    expect(detail).toMatch(/disputeReason\.trim\(\)\.length === 0/); // submit disabled without reason
  });
  it('handoff + mark-delivered use the intended APIs (code goes to the server, verbatim contract)', () => {
    expect(detail).toMatch(/\/api\/deals\/\$\{deal\.id\}\/handoff-code/);
    expect(detail).toMatch(/\/api\/deals\/\$\{deal\.id\}\/mark-delivered/);
    expect(detail).toMatch(/body: \{ code: handoffInput\.trim\(\)\.toUpperCase\(\) \}/);
  });
});

describe('security boundaries', () => {
  it('no direct client DB access is introduced (server-mediated only)', () => {
    for (const src of [myDeals, detail, read('client/src/lib/dealPresentation.ts')]) {
      expect(src).not.toMatch(/supabase/i);
      expect(src).not.toMatch(/from\(['"]deal/);
    }
  });
  it('no authoritative amount/commission calculation moves client-side', () => {
    // formatDealAmount only renders server-provided cents; no fee/percent math exists
    expect(formatDealAmount(1999)).toBe('$19.99');
    expect(formatDealAmount(null)).toBe('—');
    for (const src of [myDeals, detail, read('client/src/lib/dealPresentation.ts')]) {
      // executable code only — comments may STATE that the server owns commission
      const code = src
        .split('\n')
        .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
        .join('\n');
      expect(code).not.toMatch(/FEE_BPS|platform_fee|commission/i);
      // no multiplication on any amount/price/cents value (display-only division in the formatter is fine)
      expect(code).not.toMatch(/(price|amount|cents)[a-z_]*\s*\*/i);
    }
  });
  it('no internal Stripe identifiers are rendered', () => {
    for (const src of [myDeals, detail]) {
      expect(src).not.toMatch(/stripe_payment_intent_id|stripe_transfer_id|seller_account_id/);
    }
  });
  it('user-facing copy says Protected Payment and never claims regulated escrow', () => {
    expect(detail).toMatch(/not a regulated escrow service/);
    expect(detail).not.toMatch(/held in escrow|escrow protection|escrow system|escrow account/i);
    expect(myDeals).not.toMatch(/\bescrow\b/i);
  });
});
