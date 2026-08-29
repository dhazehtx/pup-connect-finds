/**
 * HEIC/HEIF must never enter the listing-media pipeline (browsers can't decode
 * them: they upload 200 but render as a broken 0x0 image). This proves the
 * server boundary behaviorally and guards the client + resilience changes.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { validateMediaUpload, ALLOWED_IMAGE_TYPES, LISTING_IMAGE_TYPES } from '../server/lib/mediaHelpers';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');
const SIZE = 500_000; // ~0.5 MB, under the 10MB listing cap

describe('SERVER — validateMediaUpload rejects HEIC/HEIF and accepts JPEG/PNG/WebP', () => {
  it('rejects image/heic for a listing (no signature obtainable)', () => {
    const r = validateMediaUpload('image/heic', SIZE, 'listing');
    expect(r.valid).toBe(false);
    expect(r.code).toBe('MEDIA_INVALID_TYPE');
  });
  it('rejects image/heif for a listing', () => {
    expect(validateMediaUpload('image/heif', SIZE, 'listing').valid).toBe(false);
  });
  it('accepts JPEG / PNG / WebP for a listing', () => {
    for (const t of ['image/jpeg', 'image/png', 'image/webp']) {
      expect(validateMediaUpload(t, SIZE, 'listing'), `${t} should be valid`).toMatchObject({ valid: true });
    }
  });
  it('rejects gif for a listing with a JPEG/PNG/WebP message (globally allowed, not for listings)', () => {
    const r = validateMediaUpload('image/gif', SIZE, 'listing');
    expect(r.valid).toBe(false);
    expect(r.message).toMatch(/JPEG, PNG, or WebP/i);
  });
  it('HEIC/HEIF are removed from the global allow-list too (avatars/posts never decode them either)', () => {
    expect(ALLOWED_IMAGE_TYPES).not.toContain('image/heic');
    expect(ALLOWED_IMAGE_TYPES).not.toContain('image/heif');
    expect(LISTING_IMAGE_TYPES).toEqual(['image/jpeg', 'image/png', 'image/webp']);
  });
  it('an entirely unsupported type cannot validate (→ no upload signature)', () => {
    expect(validateMediaUpload('application/pdf', SIZE, 'listing').valid).toBe(false);
    expect(validateMediaUpload('image/tiff', SIZE, 'listing').valid).toBe(false);
  });
});

describe('CLIENT — HEIC rejected before any upload, with clear feedback', () => {
  const up = read('client/src/components/listings/UnifiedMediaUpload.tsx');
  const hook = read('client/src/hooks/useMediaUpload.ts');
  it('file input no longer accepts the broad image/* that let HEIC through', () => {
    expect(up).toMatch(/accept="image\/jpeg,image\/png,image\/webp"/);
    expect(up).not.toMatch(/image\/\*/);
  });
  it('detects HEIC by MIME or extension and only uploads jpeg/png/webp', () => {
    expect(up).toMatch(/const isHeic = \(f: File\) =>/);
    expect(up).toMatch(/image\\\/hei\[cf\]/); // MIME check
    expect(up).toMatch(/\\\.\(heic\|heif\)\$/i); // extension check
    expect(up).toMatch(/SUPPORTED_IMAGE_TYPES = \['image\/jpeg', 'image\/png', 'image\/webp'\]/);
    expect(up).toMatch(/const imageFiles = photoCandidates\.filter\(isSupportedImage\)/);
  });
  it('gives clear user feedback and never uploads the rejected file', () => {
    expect(up).toMatch(/HEIC photos aren't supported yet\. Please upload JPEG, PNG, or WebP\./);
    // rejected files never reach the uploader
    expect(up).toMatch(/if \(imageFiles\.length === 0\) return;/);
  });
  it('the client preflight allow-list no longer includes HEIC/HEIF', () => {
    const block = hook.slice(hook.indexOf('const ALLOWED_IMAGE_TYPES'), hook.indexOf('const ALLOWED_VIDEO_TYPES'));
    expect(block).not.toMatch(/heic/);
    expect(block).not.toMatch(/heif/);
  });
});

describe('RESILIENCE — a transient auth probe no longer blocks healthy Storage', () => {
  const res = read('server/lib/supabaseResilience.ts');
  it('health check evaluates auth + storage independently (allSettled) and gates media on Storage', () => {
    expect(res).toMatch(/Promise\.allSettled/);
    expect(res).toMatch(/if \(storageErr\)/);
    // an auth-only failure does not degrade the media flag
    expect(res).toMatch(/auth health warning \(media unaffected\)/);
    expect(res).not.toMatch(/Promise\.all\(\[\s*withTimeout\(supabaseAdmin\.auth/);
  });
  it('a genuine success self-heals a stale degraded flag (no 60s wait)', () => {
    expect(res).toMatch(/Self-heal/);
    expect(res).toMatch(/if \(state\.mode === "degraded"\)/);
  });
});
