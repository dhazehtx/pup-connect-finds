/**
 * Session 2 — production Supabase config must fail closed.
 *
 * The browser client must never silently fall back to the shared demo project in
 * a production build (that would route real users' data to a throwaway Supabase
 * instance). In development the demo placeholders remain a convenience.
 */
import { describe, it, expect } from 'vitest';
import { resolveSupabaseConfig } from '../client/src/integrations/supabase/client';

describe('Session 2 — resolveSupabaseConfig fail-closed', () => {
  it('throws in production when the URL is missing', () => {
    expect(() =>
      resolveSupabaseConfig({ envUrl: '', envKey: 'anon-key', isProd: true }),
    ).toThrow(/Missing VITE_SUPABASE_URL/);
  });

  it('throws in production when the anon key is missing', () => {
    expect(() =>
      resolveSupabaseConfig({ envUrl: 'https://real.supabase.co', envKey: '', isProd: true }),
    ).toThrow(/Missing VITE_SUPABASE/);
  });

  it('uses real values in production when both are present', () => {
    const cfg = resolveSupabaseConfig({
      envUrl: 'https://real.supabase.co',
      envKey: 'real-anon-key',
      isProd: true,
    });
    expect(cfg.url).toBe('https://real.supabase.co');
    expect(cfg.anonKey).toBe('real-anon-key');
    expect(cfg.usedFallback).toBe(false);
  });

  it('falls back to demo placeholders in development when env is missing', () => {
    const cfg = resolveSupabaseConfig({ envUrl: '', envKey: '', isProd: false });
    expect(cfg.usedFallback).toBe(true);
    expect(cfg.url).toContain('supabase.co');
    expect(cfg.anonKey.length).toBeGreaterThan(0);
  });

  it('never returns the demo project when real env is provided in dev', () => {
    const cfg = resolveSupabaseConfig({
      envUrl: 'https://real.supabase.co',
      envKey: 'real-anon-key',
      isProd: false,
    });
    expect(cfg.url).toBe('https://real.supabase.co');
    expect(cfg.usedFallback).toBe(false);
  });
});
