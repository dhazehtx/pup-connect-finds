/**
 * Listing-media ownership: POST /api/listings must only attach media the
 * authenticated user actually OWNS (per the media_assets record), never trusting
 * a public URL, path, filename, or client-supplied id. resolveListingMedia is the
 * pure decision function, tested behaviorally here; source-guards cover the route
 * wiring (attach on success, reject before create) and the preserved abandon-cleanup.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { resolveListingMedia, validateMediaUpload, type OwnedAsset } from '../server/lib/mediaHelpers';
import { insertDogListingSchema } from '../shared/schema';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');
const SELLER = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const OTHER = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const url = (n: number) => `https://proj.supabase.co/storage/v1/object/public/listings/listing/${SELLER}/${n}.png`;

describe('resolveListingMedia — server-authoritative ownership', () => {
  it('1/8 seller can attach their OWN media (returns the owned asset ids)', () => {
    const assets: OwnedAsset[] = [
      { id: 'm1', owner_id: SELLER, public_url: url(1) },
      { id: 'm2', owner_id: SELLER, public_url: url(2) },
    ];
    const r = resolveListingMedia(SELLER, [url(1), url(2)], assets);
    expect(r.ok).toBe(true);
    expect(r.ok && r.ownedAssetIds.sort()).toEqual(['m1', 'm2']);
  });

  it("3 another user's media is REJECTED with MEDIA_NOT_OWNED (403)", () => {
    const assets: OwnedAsset[] = [{ id: 'm1', owner_id: OTHER, public_url: url(1) }];
    const r = resolveListingMedia(SELLER, [url(1)], assets);
    expect(r.ok).toBe(false);
    expect(r.ok === false && r.status).toBe(403);
    expect(r.ok === false && r.code).toBe('MEDIA_NOT_OWNED');
  });

  it('4 forged/unknown URL (no media_assets row) is REJECTED with MEDIA_NOT_FOUND (400)', () => {
    const r = resolveListingMedia(SELLER, ['https://evil.example/x.png'], []);
    expect(r.ok).toBe(false);
    expect(r.ok === false && r.status).toBe(400);
    expect(r.ok === false && r.code).toBe('MEDIA_NOT_FOUND');
  });

  it('5 ownership comes from the DB owner_id, not the URL/path/filename', () => {
    // URL path contains the SELLER uid, but the asset is owned by OTHER → still rejected.
    const deceptiveUrl = `https://proj.supabase.co/storage/v1/object/public/listings/listing/${SELLER}/hijack.png`;
    const assets: OwnedAsset[] = [{ id: 'm9', owner_id: OTHER, public_url: deceptiveUrl }];
    const r = resolveListingMedia(SELLER, [deceptiveUrl], assets);
    expect(r.ok === false && r.code).toBe('MEDIA_NOT_OWNED');
  });

  it('mixed batch: any single non-owned photo rejects the whole create', () => {
    const assets: OwnedAsset[] = [
      { id: 'm1', owner_id: SELLER, public_url: url(1) },
      { id: 'm2', owner_id: OTHER, public_url: url(2) },
    ];
    expect(resolveListingMedia(SELLER, [url(1), url(2)], assets).ok).toBe(false);
  });
});

describe('route wiring — attach on success, reject before create, preserved cleanup', () => {
  const routes = read('server/routes.ts');
  it('2/7 verified media is attached to the new listing (parent_id = listing.id)', () => {
    expect(routes).toMatch(/resolveListingMedia\(req\.user!\.id, submittedUrls, assets\)/);
    expect(routes).toMatch(/\.set\(\{ parent_type: "listing", parent_id: \(listing as \{ id: string \}\)\.id \}\)/);
    // attach is scoped to the owner's assets
    expect(routes).toMatch(/eq\(mediaAssets\.owner_id, req\.user!\.id\)/);
  });
  it('6 ownership failure returns BEFORE createDogListing (no listing, no attach)', () => {
    const postBlock = routes.slice(routes.indexOf('app.post("/api/listings"'));
    const rejectIdx = postBlock.indexOf('if (!resolved.ok)');
    const createIdx = postBlock.indexOf('await storage.createDogListing');
    expect(rejectIdx).toBeGreaterThan(0);
    expect(rejectIdx).toBeLessThan(createIdx); // reject precedes create
  });
  it('7 abandon-cleanup is preserved and only runs when the listing was NOT created', () => {
    const form = read('client/src/components/listings/CreateListingForm.tsx');
    expect(form).toMatch(/if \(!createdRef\.current\)/);
    expect(form).toMatch(/createdRef\.current = true/);
    expect(form).toMatch(/deleteAsset\(id\)/);
  });
});

describe('repaired behavior remains intact (regression)', () => {
  it('8 JPEG/PNG/WebP still validate for listings', () => {
    for (const t of ['image/jpeg', 'image/png', 'image/webp']) {
      expect(validateMediaUpload(t, 500_000, 'listing').valid).toBe(true);
    }
  });
  it('9 HEIC/HEIF remain rejected', () => {
    expect(validateMediaUpload('image/heic', 500_000, 'listing').valid).toBe(false);
    expect(validateMediaUpload('image/heif', 500_000, 'listing').valid).toBe(false);
  });
  it('10 price 1 (number) still passes the repaired contract', () => {
    const payload = {
      dog_name: 'x', breed: 'Mixed Breed', age: 10, price: 1,
      user_id: SELLER, seller_id: SELLER,
    };
    expect(insertDogListingSchema.safeParse(payload).success).toBe(true);
  });
});
