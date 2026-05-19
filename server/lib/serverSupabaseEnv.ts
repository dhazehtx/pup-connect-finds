import { normalizeSupabaseApiUrl } from '@shared/normalizeSupabaseUrl';

let warnedNormalized = false;

function canonicalOrigin(url: string): string {
  return url.trim().replace(/\/+$/, '').toLowerCase();
}

/**
 * Server: prefer `SUPABASE_URL`, then `VITE_SUPABASE_URL` (build-time name leaked to server).
 * Never use `DATABASE_URL` here — that is for Drizzle/Postgres only.
 */
export function getRawServerSupabaseUrl(): string {
  return (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
}

export function getServerSupabaseApiUrl(): string {
  const raw = getRawServerSupabaseUrl();
  const normalized = normalizeSupabaseApiUrl(raw);
  if (raw && normalized && canonicalOrigin(raw) !== canonicalOrigin(normalized) && !warnedNormalized) {
    warnedNormalized = true;
    console.warn(
      '[Supabase] SUPABASE_URL / VITE_SUPABASE_URL pointed at a Postgres pooler host (db.*.supabase.co). ' +
        'Using the project API URL instead. Set SUPABASE_URL to https://<project-ref>.supabase.co in Railway.',
    );
  }
  return normalized;
}
