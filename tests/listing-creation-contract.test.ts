/**
 * P1: POST /api/listings 400'd because the client sends `price` as a NUMBER but
 * the server's insertDogListingSchema (decimal column) expected a STRING.
 * These tests lock the client↔server contract and guard the error-UX + media
 * orphan cleanup + the two P3s. The schema tests are BEHAVIORAL (real parse).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { insertDogListingSchema } from '../shared/schema';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');

// The exact shape CreateListingForm builds (price + age as numbers), plus the
// server-derived owner ids. If the form and server contracts drift apart again,
// this fails.
const clientPayload = () => ({
  dog_name: 'PAWS CERT TEST 0828', breed: 'Mixed Breed', age: 10, price: 1,
  description: 'x', location: 'Test City, TX', gender: 'Unknown', size: 'Medium', color: 'Cream',
  vaccinated: true, neutered_spayed: false, good_with_kids: true, good_with_dogs: true,
  special_needs: false, rehoming: true, delivery_available: false,
  status: 'active', listing_status: 'active',
  images: ['https://x/1.png'], image_url: 'https://x/1.png', video_url: '',
  user_id: '11111111-1111-1111-1111-111111111111', seller_id: '11111111-1111-1111-1111-111111111111',
});

describe('client↔server listing contract (the P1 root cause)', () => {
  it('accepts the real client payload with price as a NUMBER', () => {
    const r = insertDogListingSchema.safeParse(clientPayload());
    expect(r.success, r.success ? '' : JSON.stringify(r.error?.issues)).toBe(true);
  });
  it('normalizes price to the string the decimal column stores', () => {
    const r = insertDogListingSchema.safeParse(clientPayload());
    expect(r.success && typeof (r.data as any).price).toBe('string');
    expect(r.success && (r.data as any).price).toBe('1');
  });
  it('also accepts a numeric string (belt and suspenders)', () => {
    expect(insertDogListingSchema.safeParse({ ...clientPayload(), price: '2.50' }).success).toBe(true);
  });
  it('still REJECTS invalid data (validation not weakened)', () => {
    expect(insertDogListingSchema.safeParse({ ...clientPayload(), price: -5 }).success).toBe(false);
    expect(insertDogListingSchema.safeParse({ ...clientPayload(), price: 'abc' }).success).toBe(false);
    const missing: any = clientPayload(); delete missing.breed;
    expect(insertDogListingSchema.safeParse(missing).success).toBe(false);
  });
});

describe('server returns structured field-level validation errors (safe)', () => {
  const routes = read('server/routes.ts');
  it('POST/PUT /api/listings 400s include a fields map via zodFieldErrors', () => {
    expect(routes).toMatch(/function zodFieldErrors\(error: ZodError\)/);
    expect(routes).toMatch(/fields: zodFieldErrors\(error\)/);
    // no stack/SQL leakage — only path + message
    expect(routes).toMatch(/issue\.path\.join\('\.'\)/);
  });
});

describe('create-listing error UX (no silent failure; 429 handled)', () => {
  const form = read('client/src/components/listings/CreateListingForm.tsx');
  const hook = read('client/src/hooks/useDogListings.ts');
  it('renders an accessible, persistent error surface with field detail', () => {
    expect(form).toMatch(/role="alert"/);
    expect(form).toMatch(/setSubmitError/);
    expect(form).toMatch(/form\.setError\(/);
    expect(form).toMatch(/scrollIntoView/);
  });
  it('handles 429 with an understandable message (not a raw error)', () => {
    expect(form).toMatch(/Too many attempts\. Please wait a moment and try again\./);
    expect(hook).toMatch(/Too many attempts\. Please wait a moment and try again\./);
  });
  it('never toasts the raw "API request failed" JSON string', () => {
    expect(hook).not.toMatch(/description: error\.message \|\| "Failed to create listing"/);
    expect(hook).toMatch(/Couldn't create listing/);
  });
  it('keeps double-submit protection (button disabled while loading)', () => {
    expect(form).toMatch(/disabled=\{loading \|\| !isFormValid\(\)\}/);
  });
});

describe('media orphan cleanup on abandon (Option B)', () => {
  const up = read('client/src/components/listings/UnifiedMediaUpload.tsx');
  const form = read('client/src/components/listings/CreateListingForm.tsx');
  it('the uploader captures + reports committed asset ids', () => {
    expect(up).toMatch(/assetId = result\?\.assetId/);
    expect(up).toMatch(/onAssetsChange\?\.\(\[\.\.\.committedAssets\]\)/);
  });
  it('the form deletes only its uploaded assets if the listing is never created', () => {
    expect(form).toMatch(/uploadedAssetIdsRef/);
    expect(form).toMatch(/if \(!createdRef\.current\)/);
    expect(form).toMatch(/deleteAsset\(id\)/);
    // on success, cleanup is skipped (media is now attached)
    expect(form).toMatch(/createdRef\.current = true/);
  });
});

describe('P3 — Settings single header + image-remove accessibility', () => {
  it('SettingsHubPage no longer wraps in a second <Layout> (one header)', () => {
    const s = read('client/src/pages/SettingsHubPage.tsx')
      .split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n'); // ignore comments
    expect(s).not.toMatch(/import Layout from '@\/components\/Layout'/);
    expect(s).not.toMatch(/<Layout>/);
    expect(s).not.toMatch(/<\/Layout>/);
  });
  it('image + video remove buttons have accessible names', () => {
    const up = read('client/src/components/listings/UnifiedMediaUpload.tsx');
    expect(up).toMatch(/aria-label=\{`Remove photo \$\{index \+ 1\}`\}/);
    expect(up).toMatch(/aria-label="Remove video"/);
  });
});
