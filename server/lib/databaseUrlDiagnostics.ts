import { readDatabaseUrlEnv } from './readDatabaseUrlEnv';

export type DatabaseUrlDiagnostics = {
  configured: boolean;
  host: string | null;
  port: string | null;
  user: string | null;
  usesPooler: boolean;
  issues: string[];
};

export function diagnoseDatabaseUrl(url?: string): DatabaseUrlDiagnostics {
  const raw = url ?? readDatabaseUrlEnv();
  const issues: string[] = [];

  if (!raw) {
    return {
      configured: false,
      host: null,
      port: null,
      user: null,
      usesPooler: false,
      issues: ['DATABASE_URL is not set'],
    };
  }

  let host: string | null = null;
  let port: string | null = null;
  let user: string | null = null;

  try {
    const parsed = new URL(raw);
    host = parsed.hostname;
    port = parsed.port || '5432';
    user = decodeURIComponent(parsed.username);
  } catch {
    issues.push('DATABASE_URL is not a valid URL');
    return { configured: true, host, port, user, usesPooler: false, issues };
  }

  const usesPooler = host.includes('pooler.supabase.com');

  if (host.startsWith('db.') && host.endsWith('.supabase.co')) {
    issues.push('Use Transaction pooler host (*.pooler.supabase.com), not db.*.supabase.co');
  }
  if (!usesPooler && host.includes('supabase')) {
    issues.push('Prefer Supabase pooler URI on port 6543 with ?pgbouncer=true');
  }
  if (port === '5432' && usesPooler) {
    issues.push('Pooler usually uses port 6543, not 5432');
  }
  if (user && !user.startsWith('postgres.')) {
    issues.push('Pooler user should be postgres.<project-ref>');
  }

  return { configured: true, host, port, user, usesPooler, issues };
}
