/**
 * Regression guards for the five evidence-backed P2 fixes (fast-track cert sprint).
 * Deterministic source-guards — no DB / network / render — matching the existing
 * chrome-reconcile test style.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');

describe('P2-1 — duplicate API requests are de-duplicated', () => {
  const auth = read('client/src/hooks/useAuth.ts');
  it('profile fetch is coalesced per identity (auth events no longer each refetch)', () => {
    // A single guarded loader exists and is used by BOTH auth triggers.
    expect(auth).toMatch(/const loadProfileForUser = \(userId: string\)/);
    expect(auth).toMatch(/loadedProfileUserIdRef/);
    expect(auth).toMatch(/inFlightProfileRef/);
    // Neither the getSession nor the onAuthStateChange path calls the raw
    // fetchProfile(session.user.id) directly any more.
    expect(auth).not.toMatch(/fetchProfile\(session\.user\.id\)/);
    // Cache resets on sign-out so a different user still refetches.
    expect(auth).toMatch(/resetProfileCache\(\)/);
  });
  it('favorites + support-preferences effects key on user?.id, not the user object', () => {
    const theme = read('client/src/contexts/ThemeContext.tsx');
    const grid = read('client/src/components/ListingsGrid.tsx');
    expect(theme).toMatch(/\},\s*\[user\?\.id\]\);/);
    expect(grid).toMatch(/\},\s*\[user\?\.id\]\);/);
  });
});

describe('P2-2 — stale guestMode never coexists with an authenticated session', () => {
  const auth = read('client/src/hooks/useAuth.ts');
  it('clears guestMode when a session is established and on sign-out', () => {
    // Removed in >=3 places: initial getSession, onAuthStateChange sign-in, signOut.
    const removals = auth.match(/localStorage\.removeItem\('guestMode'\)/g) || [];
    expect(removals.length).toBeGreaterThanOrEqual(3);
  });
});

describe('P2-3 — search dropdown thumbnails use the canonical media pipeline', () => {
  const search = read('server/routes/search.ts');
  it('resolves listing images via getThumbUrlsForParents/attachThumbUrls like Explore', () => {
    expect(search).toMatch(/import \{ getThumbUrlsForParents, attachThumbUrls \} from '\.\.\/lib\/mediaHelpers'/);
    expect(search).toMatch(/getThumbUrlsForParents\('listing', listingIds\)/);
    expect(search).toMatch(/attachThumbUrls\(/);
    // image now falls back thumbUrls -> image_url (not image_url only)
    expect(search).toMatch(/image: l\.thumbUrls\?\.\[0\] \|\| l\.image_url \|\| ''/);
  });
});

describe('P2-4 — Explore filter emission is debounced (no /api/listings storm)', () => {
  const af = read('client/src/components/explore/AdvancedFilters.tsx');
  it('debounces onFiltersChange but persists filters immediately', () => {
    // persistence stays synchronous
    expect(af).toMatch(/localStorage\.setItem\('exploreFilters', JSON\.stringify\(\{ \.\.\.filters \}\)\)/);
    // notification is wrapped in a cleared timeout
    expect(af).toMatch(/setTimeout\(\(\) => \{\s*onFiltersChange\(\{ \.\.\.filters, keywords: searchQuery \}\);\s*\}, 250\)/);
    expect(af).toMatch(/return \(\) => clearTimeout\(t\)/);
  });
});

describe('P2-5 — legal pages set specific document titles', () => {
  const legalDir = path.resolve(__dirname, '..', 'client/src/pages/legal');
  const files = readdirSync(legalDir).filter((f) => f.endsWith('.tsx'));
  const expected: Record<string, RegExp> = {
    'TermsOfService.tsx': /document\.title = 'Terms of Service — PAWS'/,
    'PrivacyPolicy.tsx': /document\.title = 'Privacy Policy — PAWS'/,
    'ShippingPolicy.tsx': /document\.title = 'Shipping Policy — PAWS'/,
    'ReturnsPolicy.tsx': /document\.title = 'Returns & Refunds — PAWS'/,
    'CommunityGuidelines.tsx': /document\.title = 'Community Guidelines — PAWS'/,
    'AccountDataRequests.tsx': /document\.title = 'Account & Data Requests — PAWS'/,
  };
  it('every legal page sets a title, and the four named pages match their spec', () => {
    for (const f of files) {
      const src = readFileSync(path.join(legalDir, f), 'utf8');
      expect(src, `${f} must set document.title`).toMatch(/document\.title = '.+— PAWS'/);
      if (expected[f]) expect(src, `${f} title`).toMatch(expected[f]);
    }
  });
});
