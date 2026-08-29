/**
 * Regression guards for the authenticated-navigation + create-listing repair pass.
 * Deterministic source-guards (no DB/render). Runtime behavior of the authed
 * account menu + create-listing is additionally certified by the Playwright
 * marketplace/auth harness the owner runs.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');

describe('Authenticated navigation — account menu', () => {
  const menu = read('client/src/components/layout/AccountMenu.tsx');
  const header = read('client/src/components/layout/StickyHeader.tsx');
  const app = read('client/src/App.tsx');

  it('AccountMenu exposes the real account destinations + Logout', () => {
    for (const to of ['/profile', '/my-listings', '/favorites', '/orders', '/messages', '/settings']) {
      expect(menu, `account menu must link ${to}`).toMatch(new RegExp(`to:\\s*'${to.replace('/', '\\/')}'`));
    }
    expect(menu).toMatch(/signOut\(\)/); // Logout
    expect(menu).toMatch(/Logout/);
  });
  it('AccountMenu renders nothing for signed-out users', () => {
    expect(menu).toMatch(/if \(!user\) return null/);
  });
  it('StickyHeader mounts AccountMenu for authenticated (non-guest) users', () => {
    expect(header).toMatch(/import AccountMenu/);
    expect(header).toMatch(/\{user && !isGuest && <AccountMenu \/>\}/);
  });
  it('admin control stays gated on profile.is_admin (no role assumption for buyer/seller)', () => {
    expect(header).toMatch(/profile\?\.is_admin/);
    // buyer/seller (non-admin) never get the admin shield; it is not role-based nav
    expect(header).not.toMatch(/isSeller|role === 'seller'|sellerMode/);
  });
  it('the Favorites page is actually routed (was orphaned)', () => {
    expect(app).toMatch(/LazyFavorites = lazy\(\(\) => import\('\.\/pages\/Favorites'\)\)/);
    expect(app).toMatch(/path="\/favorites"/);
  });
  it('guest/primary marketplace nav is preserved (Explore/Shop/Services/Help)', () => {
    expect(header).toMatch(/label: 'Explore'/);
    expect(header).toMatch(/label: 'Shop'/);
    expect(header).toMatch(/label: 'Services'/);
    expect(header).toMatch(/label: 'Help'/);
  });
});

describe('Create Listing — media preview + honest upload status', () => {
  const up = read('client/src/components/listings/UnifiedMediaUpload.tsx');
  it('preview uses a LOCAL object URL (not the remote/premature URL)', () => {
    expect(up).toMatch(/URL\.createObjectURL\(file\)/);
    expect(up).toMatch(/src=\{item\.previewUrl\}/);
    expect(up).not.toMatch(/src=\{url\}/); // old broken remote-src preview is gone
  });
  it('object URLs are revoked on remove and on unmount (no leaks / stale blobs)', () => {
    expect(up).toMatch(/URL\.revokeObjectURL\(target\.previewUrl\)/);
    expect(up).toMatch(/objectUrlsRef\.current\.forEach\(URL\.revokeObjectURL\)/);
  });
  it('does NOT claim a local selection is a completed upload', () => {
    expect(up).not.toMatch(/Media uploaded/);
    expect(up).not.toMatch(/ready for your listing/);
    // honest wording, gated on a real committed upload count
    expect(up).toMatch(/Photo uploaded/);
    expect(up).toMatch(/photo\(s\) uploaded|added to your listing/);
    expect(up).toMatch(/if \(uploaded > 0\)/);
  });
  it('a failed remote upload is surfaced, not silently treated as success', () => {
    expect(up).toMatch(/markFailed\(item\.previewUrl\)/);
    expect(up).toMatch(/failed: true/);
    expect(up).toMatch(/Upload failed/); // per-item indicator
  });
  it('only committed remote URLs are handed to the form (submit gate integrity)', () => {
    expect(up).toMatch(/onImagesChange\(\[\.\.\.committed\]\)/);
    expect(up).toMatch(/committed\.push\(url\)/);
  });
});

describe('Create Listing — toggle switches have an unmistakable ON/OFF', () => {
  const css = read('client/src/index.css');
  const fields = read('client/src/components/listings/ListingFormFields.tsx');
  it('the global button catch-all no longer clobbers Radix switches', () => {
    expect(css).toMatch(/button:not\(\.active\):not\(\[role="switch"\]\)\[data-state\]/);
    expect(css).toMatch(/\[data-state="on"\]:not\(\[role="switch"\]\)/);
  });
  it('switches get explicit checked (blue) vs unchecked (gray) track colors', () => {
    expect(css).toMatch(/button\[role="switch"\]\[data-state="checked"\]/);
    expect(css).toMatch(/button\[role="switch"\]\[data-state="unchecked"\]/);
  });
  it('each toggle is bound to its boolean and updates it (Case A state works)', () => {
    for (const name of ['vaccinated', 'neutered_spayed', 'good_with_kids', 'good_with_dogs', 'special_needs', 'rehoming', 'delivery_available']) {
      expect(fields, `${name} switch`).toMatch(new RegExp(`name="${name}"`));
    }
    expect(fields).toMatch(/onCheckedChange=\{field\.onChange\}/);
    expect(fields).toMatch(/checked=\{field\.value \?\? false\}/);
  });
  it('all seven booleans are submitted in the create payload', () => {
    const form = read('client/src/components/listings/CreateListingForm.tsx');
    for (const name of ['vaccinated', 'neutered_spayed', 'good_with_kids', 'good_with_dogs', 'special_needs', 'rehoming', 'delivery_available']) {
      expect(form).toMatch(new RegExp(`${name}: data\\.${name}`));
    }
  });
});
