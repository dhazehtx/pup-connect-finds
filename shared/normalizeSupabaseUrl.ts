/**
 * Supabase JS expects the HTTPS **project API** URL (`https://<ref>.supabase.co`).
 * If `SUPABASE_URL` / `VITE_SUPABASE_URL` is mistakenly set to the **Postgres pooler**
 * host (`db.<ref>.supabase.co`), Realtime builds `wss://db.*…` and can fail on Railway
 * (e.g. ENETUNREACH on IPv6). This normalizes that case to the correct API origin.
 */
function extractHostname(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  try {
    if (/^postgres(ql)?:/i.test(t)) {
      const u = new URL(t.replace(/^postgresql:/i, 'http:').replace(/^postgres:/i, 'http:'));
      return u.hostname || null;
    }
    const u = new URL(/^https?:/i.test(t) ? t : `https://${t}`);
    return u.hostname || null;
  } catch {
    return null;
  }
}

export function normalizeSupabaseApiUrl(input: string): string {
  const raw = (input || '').trim();
  if (!raw) return '';

  const host = extractHostname(raw);
  if (!host) {
    return /^https?:/i.test(raw) ? raw.replace(/\/+$/, '') : `https://${raw}`.replace(/\/+$/, '');
  }

  const hl = host.toLowerCase();
  if (hl.startsWith('db.') && hl.endsWith('.supabase.co')) {
    const ref = hl.slice('db.'.length, hl.length - '.supabase.co'.length);
    if (ref) return `https://${ref}.supabase.co`;
  }

  if (hl.endsWith('.supabase.co')) {
    return `https://${hl}`;
  }

  if (/^https?:/i.test(raw)) {
    try {
      return new URL(raw).origin;
    } catch {
      return raw.replace(/\/+$/, '');
    }
  }

  return `https://${host}`.replace(/\/+$/, '');
}
