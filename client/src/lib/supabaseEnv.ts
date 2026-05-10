/**
 * Browser deployment label (Vite mode: development | staging | production).
 */
export function getClientDeploymentEnv(): string {
  return import.meta.env.MODE || 'development';
}

/**
 * Canonical public origin for Supabase Auth redirects (email confirmation, password reset, OAuth).
 * When `NEXT_PUBLIC_BASE_URL` is set (staging/production builds), use it so links match the
 * Site URL / redirect allow list in the Supabase dashboard. Otherwise use the current origin (local dev).
 */
export function getPublicSiteOrigin(): string {
  const fromEnv = import.meta.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

function safeUrlHost(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function redactAnonKeyForLog(key: string): string {
  if (!key?.trim()) return '(missing)';
  const t = key.trim();
  if (t.length <= 12) return `(len=${t.length})`;
  return `${t.slice(0, 8)}…${t.slice(-4)} (len=${t.length})`;
}

let clientValidationLogged = false;

/**
 * One-time validation log for the browser Supabase client (URL host + redacted anon key).
 */
export function logSupabaseBrowserClientValidation(url: string, anonKey: string): void {
  if (clientValidationLogged) return;
  clientValidationLogged = true;
  console.info(
    '[supabase:client]',
    JSON.stringify({
      mode: getClientDeploymentEnv(),
      urlHost: safeUrlHost(url),
      anonKey: redactAnonKeyForLog(anonKey),
    }),
  );
}
