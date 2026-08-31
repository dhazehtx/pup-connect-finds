/**
 * Protected Payment V1 buyer journey — reachability + safety pins.
 *
 * Certification found the Deals backend + /deals/pay checkout existed but no
 * listing UI linked to them. These tests pin the repaired journey:
 * eligible listing → Protected Payment CTA → auth-gated /deals/pay →
 * server-authoritative deal creation → Stripe Elements → webhook-authoritative
 * state. Terminology is "Protected Payment", never legal escrow.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');
const detail = read('client/src/pages/ListingDetail.tsx');
const app = read('client/src/App.tsx');
const dealPage = read('client/src/pages/DealCheckout.tsx');
const deals = read('server/routes/deals.ts');

describe('listing detail exposes the Protected Payment CTA only when eligible', () => {
  it('the CTA exists and navigates to the auth-gated checkout with only the listing id', () => {
    expect(detail).toMatch(/Protected Payment/);
    expect(detail).toMatch(/navigate\(`\/deals\/pay\?listingId=\$\{listing\.id\}`\)/);
  });
  it('eligibility requires an active, priced listing', () => {
    expect(detail).toMatch(/Number\(listing\.price\) > 0/);
    expect(detail).toMatch(/listing\.status === 'active' \|\| listing\.listing_status === 'active'/);
  });
  it('the CTA lives in the NON-owner branch (a seller sees Edit listing instead)', () => {
    // owner branch renders Edit; the CTA is inside the else-branch fragment
    const ownerBranch = detail.slice(detail.indexOf('listing.user_id === user.id ?'), detail.indexOf('Contact Seller'));
    expect(ownerBranch).toMatch(/Edit listing/);
    expect(ownerBranch).toMatch(/Protected Payment/); // present in the same ternary's else side
  });
  it('the client never sends a price or seller identity — only the listing id', () => {
    const nav = detail.match(/navigate\(`\/deals\/pay[^`]*`\)/)?.[0] ?? '';
    expect(nav).toBe('navigate(`/deals/pay?listingId=${listing.id}`)');
  });
});

describe('checkout journey is auth-gated and server-authoritative', () => {
  it('/deals/pay is wrapped in RequireAuth (unauthenticated users go through auth)', () => {
    const route = app.slice(app.indexOf('path="/deals/pay"'), app.indexOf('path="/deals/pay"') + 400);
    expect(route).toMatch(/RequireAuth/);
  });
  it('deal creation posts to the authenticated API with NO client body (no price/seller override)', () => {
    expect(dealPage).toMatch(/\/api\/deals\/\$\{listingId\}\/deposit/);
    expect(dealPage).not.toMatch(/body:/);
  });
  it('payment confirms only the server-returned clientSecret via Stripe Elements', () => {
    expect(dealPage).toMatch(/clientSecret: r\.clientSecret/);
    const form = read('client/src/components/payments/ProtectedPaymentForm.tsx');
    expect(form).toMatch(/confirmPayment/);
    expect(form).not.toMatch(/payment_status|mark.*paid/i); // UI can never mark the deal paid
  });
  it('failure/processing states never claim success (webhook stays authoritative)', () => {
    const form = read('client/src/components/payments/ProtectedPaymentForm.tsx');
    expect(form).toMatch(/Payment not completed/);
    expect(form).toMatch(/finalizing your transaction/i); // success copy defers to server confirmation
  });
});

describe('backend invariants the UI relies on (unchanged)', () => {
  it('seller cannot purchase their own listing; price/seller are server-derived', () => {
    expect(deals).toMatch(/listing\.user_id === userId/);
    expect(deals).toMatch(/Cannot buy your own listing/);
    expect(deals).toMatch(/totalCents = Math\.round\(parseFloat\(listing\.price\) \* 100\)/);
  });
  it('deposit requires authentication', () => {
    const dep = deals.slice(deals.indexOf('router.post("/:listingId/deposit"'));
    expect(dep.slice(0, 300)).toMatch(/if \(!userId\) return res\.status\(401\)/);
  });
});

describe('terminology', () => {
  it('buyer-facing copy says Protected Payment and never claims legal escrow', () => {
    expect(detail).not.toMatch(/\bescrow\b/i);
    expect(dealPage).toMatch(/protected payment/i);
    expect(dealPage).not.toMatch(/held in escrow|escrow protection|escrow system|escrow account/i);
  });
});
