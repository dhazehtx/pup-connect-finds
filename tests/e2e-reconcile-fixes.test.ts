/**
 * Regressions for the browser-E2E reconciliation pass. Source-guard style
 * (deterministic, no DB/network) — each pins a specific P0/P1/P2 fix.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');

describe('P0-A — order history sends the bearer token; route rejects unauth', () => {
  const client = read('client/src/pages/OrderHistory.tsx');
  const route = read('server/routes/orders.ts');
  it('OrderHistory attaches authHeaders() to the fetch', () => {
    expect(client).toMatch(/import \{ authHeaders \} from '@\/lib\/api'/);
    expect(client).toMatch(/\.\.\.\(await authHeaders\(\)\)/);
  });
  it('route returns 401 when unauthenticated and 403 only on genuine non-ownership', () => {
    expect(route).toMatch(/if \(!requestingUserId\)/);
    expect(route).toMatch(/status\(401\)/);
    expect(route).toMatch(/user_id !== requestingUserId && !req\.user\?\.is_admin/);
  });
});

describe('P0-B/C — guest Explore shows REAL inventory, never fabricated demo data', () => {
  const guest = read('client/src/pages/ExploreGuest.tsx');
  it('no hardcoded demo listings remain', () => {
    expect(guest).not.toMatch(/GUEST_DEMO_LISTINGS/);
    expect(guest).not.toMatch(/isDemo:\s*true/);
    expect(guest).not.toMatch(/goldenRetrieverImg|labradorImg|germanShepherdImg|frenchBulldogImg/);
  });
  it('queries real dog_listings via useDogListings and applies filters', () => {
    expect(guest).toMatch(/useDogListings\(\)/);
    expect(guest).toMatch(/filters\.keywords/);
    expect(guest).toMatch(/filters\.breeds/);
    expect(guest).toMatch(/filters\.priceRange/);
  });
  it('guest cards open the public listing detail (keyboard accessible)', () => {
    expect(guest).toMatch(/navigate\(`\/listing\/\$\{listing\.id\}`\)/);
    expect(guest).toMatch(/role="link"/);
    expect(guest).toMatch(/onKeyDown=/);
  });
});

describe('P0-D — Sign Out is discoverable and clears account state', () => {
  const profile = read('client/src/components/profile/UnifiedProfileView.tsx');
  const auth = read('client/src/hooks/useAuth.ts');
  it('the profile menu contains a Sign out item, separate from Delete account', () => {
    const menuStart = profile.indexOf('Profile menu');
    const signOutIdx = profile.indexOf('Sign out', menuStart);
    const deleteIdx = profile.indexOf('Delete account', menuStart);
    expect(signOutIdx).toBeGreaterThan(menuStart);
    expect(deleteIdx).toBeGreaterThan(signOutIdx); // sign out listed before delete
  });
  it('signOut clears the React Query cache (no stale identity/filters)', () => {
    expect(auth).toMatch(/queryClient\.clear\(\)/);
    expect(auth).toMatch(/import \{ queryClient \} from '@\/lib\/queryClient'/);
  });
});

describe('P1 — Contact Seller: direct thread nav + primary CTA + guest redirect', () => {
  const detail = read('client/src/pages/ListingDetail.tsx');
  it('does find-or-create and navigates DIRECTLY to /messages/:conversationId', () => {
    expect(detail).toMatch(/conversations\/find-or-create/);
    expect(detail).toMatch(/navigate\(`\/messages\/\$\{conversationId\}`\)/);
    expect(detail).not.toMatch(/\/messages\?contact=/); // no inbox hop
  });
  it('routes a guest to auth with return context (never a silent no-op)', () => {
    expect(detail).toMatch(/navigate\(`\/auth\?next=/);
  });
  it('CTA is a solid primary button (not plain text)', () => {
    expect(detail).toMatch(/Contact Seller/);
    expect(detail).toMatch(/bg-blue-600[\s\S]{0,40}text-white|text-white[\s\S]{0,40}bg-blue-600/);
  });
});

describe('P2 — guest block-status is gated on auth (no noisy 401)', () => {
  const hook = read('client/src/hooks/useBlocks.ts');
  it('useBlockStatus is enabled only when a user is signed in', () => {
    expect(hook).toMatch(/enabled:\s*!!userId && !!user/);
    expect(hook).toMatch(/useAuth/);
  });
});

describe('Phase 6 — /api/health/live exposes a non-secret commit id', () => {
  const health = read('server/routes/health.ts');
  it('adds commit from RAILWAY_GIT_COMMIT_SHA with a safe fallback', () => {
    const idx = health.indexOf('/api/health/live');
    expect(health.indexOf('commit:', idx)).toBeGreaterThan(idx);
    expect(health).toMatch(/RAILWAY_GIT_COMMIT_SHA/);
    expect(health.slice(idx, idx + 600)).toMatch(/"unknown"/);
  });
});
