/**
 * Session 6 — brand identity is coherent and configurable.
 *   - The canonical name is PAWS (single source of truth).
 *   - Operational values (support email, from address, legal entity, app URL)
 *     come from env with sane defaults; the legal entity is never fabricated.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BRAND } from '../shared/brand';

describe('Session 6 — canonical brand constant', () => {
  it('uses PAWS as the public product name', () => {
    expect(BRAND.name).toBe('PAWS');
  });

  it('never ships a fabricated legal entity by default', () => {
    expect(BRAND.legalEntity).toBe('');
  });

  it('uses the real product domain for contact defaults (no example.com placeholders)', () => {
    expect(BRAND.supportEmail).not.toMatch(/example\.com|paws\.app|mypup|pupconnect/i);
    expect(BRAND.supportEmail).toContain(BRAND.domain);
    expect(BRAND.fromEmail).toContain(BRAND.domain);
  });
});

describe('Session 6 — server brand resolver honors env overrides', () => {
  const OLD = { ...process.env };
  beforeEach(() => vi.resetModules());
  afterEach(() => {
    process.env = { ...OLD };
  });

  it('overrides support email, from address, legal entity, and app URL from env', async () => {
    process.env.SUPPORT_EMAIL = 'help@example-real.com';
    process.env.FROM_EMAIL = 'noreply@example-real.com';
    process.env.LEGAL_ENTITY_NAME = 'Example Real LLC';
    process.env.PUBLIC_APP_URL = 'https://app.example-real.com';
    const { getBrand } = await import('../server/lib/brand');
    const b = getBrand();
    expect(b.name).toBe('PAWS');
    expect(b.supportEmail).toBe('help@example-real.com');
    expect(b.fromEmail).toBe('noreply@example-real.com');
    expect(b.legalEntity).toBe('Example Real LLC');
    expect(b.appUrl).toBe('https://app.example-real.com');
  });

  it('falls back to canonical defaults (and empty legal entity) when env is unset', async () => {
    delete process.env.SUPPORT_EMAIL;
    delete process.env.FROM_EMAIL;
    delete process.env.SENDGRID_FROM;
    delete process.env.LEGAL_ENTITY_NAME;
    delete process.env.PUBLIC_APP_URL;
    delete process.env.APP_URL;
    delete process.env.FRONTEND_URL;
    const { getBrand } = await import('../server/lib/brand');
    const b = getBrand();
    expect(b.supportEmail).toBe(BRAND.supportEmail);
    expect(b.legalEntity).toBe('');
    expect(b.appUrl).toBe(`https://${BRAND.domain}`);
  });
});
