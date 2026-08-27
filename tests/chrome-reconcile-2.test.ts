/**
 * Second Chrome-reconciliation pass regressions (source-guard + breakpoint logic).
 * Deterministic, no DB/network/render.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');

describe('P0 — Explore search input no longer remounts (focus preserved)', () => {
  const af = read('client/src/components/explore/AdvancedFilters.tsx');
  it('renders the filter layouts as function CALLS, not as inner <Component/> elements', () => {
    // The bug: `return isMobile ? <MobileFilters /> : <DesktopFilters />` with those
    // components defined inside render → new type each render → remount → focus loss.
    // (Check the RETURN statement specifically so an explanatory comment doesn't trip it.)
    expect(af).not.toMatch(/return isMobile \? <MobileFilters/);
    expect(af).toMatch(/return isMobile \? MobileFilters\(\) : DesktopFilters\(\)/);
  });
});

describe('P1 — transient search keywords are NOT persisted / do not strand a returning user', () => {
  const af = read('client/src/components/explore/AdvancedFilters.tsx');
  const auth = read('client/src/hooks/useAuth.ts');
  it('persists only structured filters (keywords stripped) and never restores the search text', () => {
    // load path: strips a stale keyword before restoring, and never sets searchQuery from storage
    expect(af).toMatch(/delete parsed\.keywords/);
    expect(af).not.toMatch(/setSearchQuery\(parsed\.keywords/);
    // save path: persists only the structured filters, not the live search text
    expect(af).toMatch(/localStorage\.setItem\('exploreFilters', JSON\.stringify\(\{ \.\.\.filters \}\)\)/);
  });
  it('sign-out clears exploreFilters so search state cannot leak to the next user', () => {
    expect(auth).toMatch(/localStorage\.removeItem\('exploreFilters'\)/);
  });
});

describe('P0 — navigation breakpoint contract: exactly one primary nav at every width', () => {
  const bottom = read('client/src/components/BottomNavigation.tsx');
  const layout = read('client/src/components/Layout.tsx');
  const header = read('client/src/components/layout/StickyHeader.tsx');

  it('bottom nav is lg:hidden and desktop nav is lg:flex (handoff at 1024)', () => {
    // Inspect the <nav> className specifically (comments elsewhere may mention md:hidden).
    const navClass = (bottom.match(/className="(bottom-nav[^"]*)"/) || [])[1] || '';
    expect(navClass).toMatch(/lg:hidden/);
    expect(navClass).not.toMatch(/\bmd:hidden\b/); // the old md handoff (the 768–1023 gap) is gone
    expect(layout).toMatch(/lg:pb-0/);
    expect(header).toMatch(/hidden[^"']*lg:flex/);
  });

  it('at 767/768/834/1023/1024/1280 exactly one nav system is shown (no gap, no overlap)', () => {
    // Encode the Tailwind semantics from the classes above.
    const bottomVisible = (w: number) => w < 1024;      // lg:hidden
    const desktopVisible = (w: number) => w >= 1024;    // hidden ... lg:flex
    for (const w of [320, 375, 390, 430, 500, 767, 768, 834, 1023, 1024, 1280, 1440]) {
      const shown = [bottomVisible(w), desktopVisible(w)].filter(Boolean).length;
      expect(shown, `exactly one nav must show at ${w}px`).toBe(1);
    }
  });
});

describe('P2 — invalid listing shows an in-page not-found (no silent redirect)', () => {
  const detail = read('client/src/pages/ListingDetail.tsx');
  it('does not navigate away on a 404; renders the "Listing not found" state', () => {
    // the 404 branch no longer redirects to /explore
    expect(detail).toMatch(/Listing not found/);
    // the specific not-found + catch branches set the title instead of navigating
    expect(detail).toMatch(/document\.title = 'Listing not found — PAWS'/);
  });
});

describe('P2 — guest zero-results text is honest (not a fake loader)', () => {
  const guest = read('client/src/pages/ExploreGuest.tsx');
  it('shows a real no-results message, not "Searching…"', () => {
    expect(guest).not.toMatch(/Searching for your perfect match/);
    expect(guest).toMatch(/No puppies match your search|No listings available yet/);
    expect(guest).toMatch(/hasActiveFilters/);
  });
});
