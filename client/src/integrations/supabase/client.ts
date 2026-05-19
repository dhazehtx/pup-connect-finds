// Supabase browser client — lazy-init so dev/HMR never calls createClient with a bad URL at module-eval time.
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { normalizeSupabaseApiUrl } from '@shared/normalizeSupabaseUrl';
import type { Database } from './types';

const DEV_FALLBACK_URL = 'https://abcdefghijklmnop.supabase.co';
const DEV_FALLBACK_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

/** Vite inlines env; avoid treating missing vars as the literal strings "undefined" / "null". */
function viteEnvString(key: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY'): string {
  const v = import.meta.env[key];
  if (typeof v !== 'string') return '';
  const t = v.trim();
  if (!t || t === 'undefined' || t === 'null') return '';
  return t;
}

function createWithOptions(url: string, anonKey: string): SupabaseClient<Database> {
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });
}

function buildClient(): SupabaseClient<Database> {
  let envUrl = viteEnvString('VITE_SUPABASE_URL');
  let envKey = viteEnvString('VITE_SUPABASE_ANON_KEY');
  if (envUrl && !/^https?:\/\//i.test(envUrl)) {
    envUrl = '';
  }
  if (envUrl) {
    envUrl = normalizeSupabaseApiUrl(envUrl);
  }
  const url = envUrl || DEV_FALLBACK_URL;
  const anonKey = envKey || DEV_FALLBACK_ANON_KEY;

  if (!envUrl || !envKey) {
    console.warn(
      '[supabase] VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY missing — using placeholders. Add both to repo-root `.env`.',
    );
  }

  try {
    if (!url || !anonKey) {
      return createWithOptions(DEV_FALLBACK_URL, DEV_FALLBACK_ANON_KEY);
    }
    return createWithOptions(url, anonKey);
  } catch (e) {
    console.warn('[supabase] createClient failed, using demo URL/key:', e);
    return createWithOptions(DEV_FALLBACK_URL, DEV_FALLBACK_ANON_KEY);
  }
}

declare global {
  interface Window {
    __supabase_client?: SupabaseClient<Database>;
  }
}

let cached: SupabaseClient<Database> | null = null;

function getSupabaseClient(): SupabaseClient<Database> {
  if (typeof window !== 'undefined' && window.__supabase_client) {
    return window.__supabase_client;
  }
  if (!cached) {
    cached = buildClient();
    if (typeof window !== 'undefined') {
      window.__supabase_client = cached;
    }
  }
  return cached;
}

/**
 * Lazy proxy so importing this module never runs `createClient` until something touches the client
 * (avoids empty `import.meta.env` edge cases with standalone Vite / plugin order).
 */
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_t, prop, _r) {
    const c = getSupabaseClient();
    const v = Reflect.get(c as object, prop, c);
    return typeof v === 'function' ? (v as (...a: unknown[]) => unknown).bind(c) : v;
  },
  has(_t, prop) {
    return prop in getSupabaseClient();
  },
});
