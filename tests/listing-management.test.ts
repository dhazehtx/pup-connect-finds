/**
 * Seller management repair: dead View/Edit controls, blank listing titles
 * (dog_name vs the unused `title` column), owner edit flow, and detail-page owner
 * controls. listingDisplayName is the shared canonical-name helper — tested
 * behaviorally (the exact cert case); wiring + server authorization are guarded.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { listingDisplayName } from '../client/src/lib/listingDisplay';
import { insertDogListingSchema } from '../shared/schema';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');

describe('listingDisplayName — canonical name, no blank cards (behavioral)', () => {
  it('the exact certification case: dog_name set, title null → the dog name', () => {
    expect(listingDisplayName({ dog_name: 'PAWS CERT TEST 0828', title: null }))
      .toBe('PAWS CERT TEST 0828');
  });
  it('prefers dog_name, falls back to a legacy title, then a neutral placeholder', () => {
    expect(listingDisplayName({ dog_name: 'Rex', title: 'Legacy' })).toBe('Rex');
    expect(listingDisplayName({ dog_name: '  ', title: 'Legacy Title' })).toBe('Legacy Title');
    expect(listingDisplayName({ dog_name: null, title: null })).toBe('Untitled listing');
    expect(listingDisplayName(undefined)).toBe('Untitled listing');
  });
});

describe('My Listings controls are wired (View + Edit no longer dead)', () => {
  const page = read('client/src/pages/MyListingsPage.tsx');
  it('View navigates to the real listing detail route by id', () => {
    expect(page).toMatch(/onClick=\{\(\) => navigate\(`\/listing\/\$\{listing\.id\}`\)\}/);
  });
  it('Edit navigates to the owner edit route by id', () => {
    expect(page).toMatch(/onClick=\{\(\) => navigate\(`\/edit-listing\/\$\{listing\.id\}`\)\}/);
  });
  it('title, alt, delete label + search use the canonical display name (no blank title)', () => {
    expect(page).not.toMatch(/\{listing\.title\}/);
    expect(page).not.toMatch(/alt=\{listing\.title\}/);
    expect(page).toMatch(/listingDisplayName\(listing\)/);
  });
});

describe('buyer-facing card no longer renders a blank title', () => {
  const card = read('client/src/components/listings/OptimizedListingCard.tsx');
  it('OptimizedListingCard uses listingDisplayName, not listing.title', () => {
    expect(card).toMatch(/import \{ listingDisplayName \}/);
    expect(card).not.toMatch(/\{listing\.title\}/);
    expect(card).toMatch(/listingDisplayName\(listing\)/);
  });
});

describe('owner edit flow reuses the form architecture', () => {
  const edit = read('client/src/pages/EditListingPage.tsx');
  const app = read('client/src/App.tsx');
  const fields = read('client/src/components/listings/ListingFormFields.tsx');
  it('/edit-listing/:id is a real guarded route', () => {
    expect(app).toMatch(/LazyEditListing = lazy\(\(\) => import\('\.\/pages\/EditListingPage'\)\)/);
    expect(app).toMatch(/path="\/edit-listing\/:id"/);
    expect(app).toMatch(/<RequireAuth>[\s\S]{0,120}LazyEditListing/);
  });
  it('reuses ListingFormFields + updateListing (PUT), not a second editor', () => {
    expect(edit).toMatch(/import ListingFormFields from/);
    expect(edit).toMatch(/<ListingFormFields form=\{form\} hideMedia/);
    expect(edit).toMatch(/updateListing\(listing\.id,/);
  });
  it('carries existing photos through untouched (v1 defers photo editing)', () => {
    expect(edit).toMatch(/images: Array\.isArray\(listing\.images\)/);
    expect(fields).toMatch(/hideMedia/); // media section is conditionally hidden
    expect(fields).toMatch(/\{!hideMedia && \(/);
  });
  it('client restricts editing to the owner (server still enforces it too)', () => {
    expect(edit).toMatch(/listing\.user_id !== user\.id/);
    expect(edit).toMatch(/You can only edit your own listings/);
  });
});

describe('detail page shows an owner Edit control (not to others)', () => {
  const detail = read('client/src/pages/ListingDetail.tsx');
  it('owner sees Edit → /edit-listing/:id; non-owner sees Contact Seller', () => {
    expect(detail).toMatch(/user && listing && listing\.user_id === user\.id \?/);
    expect(detail).toMatch(/navigate\(`\/edit-listing\/\$\{listing\.id\}`\)/);
    expect(detail).toMatch(/Contact Seller/); // non-owner branch preserved
  });
});

describe('server authorization for edit is unchanged / authoritative', () => {
  const routes = read('server/routes.ts');
  it('PUT /api/listings/:id requires auth + owner and strips client identity', () => {
    expect(routes).toMatch(/app\.put\("\/api\/listings\/:id", requireAuth, requireOwner\('listing'\)/);
    expect(routes).toMatch(/const \{ user_id: _u, seller_id: _s, \.\.\.rest \} = \(req\.body/);
  });
  it('the edit payload (price as number, partial) is accepted by the server schema', () => {
    const editPayload = { dog_name: 'Rex', price: 1, description: 'updated' };
    expect(insertDogListingSchema.partial().safeParse(editPayload).success).toBe(true);
    // negative price still rejected on edit
    expect(insertDogListingSchema.partial().safeParse({ price: -1 }).success).toBe(false);
  });
});
