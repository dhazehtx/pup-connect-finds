import { getServerDeploymentEnv } from './deploymentEnv';

/** Same resolution order as existing server code: prefer VITE_ for parity with the client bundle. */
export function resolveServerSupabaseUrl(): string | undefined {
  return process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || undefined;
}

export function resolveServerSupabaseAdminUrl(): string | undefined {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || undefined;
}

function safeUrlHost(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/** Safe for logs — never print full secrets. */
export function redactSupabaseKeyForLog(key: string): string {
  if (!key?.trim()) return '(missing)';
  const t = key.trim();
  if (t.length <= 12) return `(len=${t.length})`;
  return `${t.slice(0, 8)}…${t.slice(-4)} (len=${t.length})`;
}

let serverSupabaseLogged = false;

/**
 * Logs once per process when the first server Supabase client is created (service or admin module).
 */
export function logSupabaseServerConfigOnce(
  url: string,
  serviceKey: string,
  label: 'service' | 'admin',
): void {
  if (serverSupabaseLogged) return;
  serverSupabaseLogged = true;
  console.info(
    '[supabase:server]',
    JSON.stringify({
      client: label,
      deployment: getServerDeploymentEnv(),
      urlHost: safeUrlHost(url),
      serviceKey: redactSupabaseKeyForLog(serviceKey),
    }),
  );
}

export function logSupabaseStorageContext(bucketName: string): void {
  const url = resolveServerSupabaseAdminUrl();
  console.info(
    '[supabase:storage]',
    JSON.stringify({
      deployment: getServerDeploymentEnv(),
      supabaseHost: url ? safeUrlHost(url) : null,
      bucket: bucketName,
    }),
  );
}
