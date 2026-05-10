import { isDevelopment, isStaging } from './nodeEnv';

/**
 * True if the connection string likely refers to a production database (hostname, path, or db name).
 * Uses word-boundary matching so "product" does not match.
 */
export function connectionStringReferencesProductionDb(connectionString: string): boolean {
  return /\bprod(uction)?\b/i.test(connectionString);
}

function collectDatabaseUrls(): string[] {
  const raw = [process.env.DATABASE_URL, process.env.NEON_DATABASE_URL].filter(
    (s): s is string => typeof s === 'string' && s.trim().length > 0,
  );
  return raw;
}

/**
 * Staging must use a dedicated database. Throws if NODE_ENV=staging and any configured
 * DB URL looks like production. Does not change how connections are created elsewhere.
 */
export function assertEnvironmentSafety(): void {
  if (!isStaging()) return;

  for (const url of collectDatabaseUrls()) {
    if (connectionStringReferencesProductionDb(url)) {
      throw new Error(
        '[env] assertEnvironmentSafety: NODE_ENV=staging cannot use a production database URL. ' +
          'Set DATABASE_URL / NEON_DATABASE_URL to a dedicated staging database (no "prod" / "production" in the connection string).',
      );
    }
  }
}

/** Hostname (and optional db name) for logs — never logs password or full URL. */
export function describeDatabaseForLog(): { configured: boolean; host?: string; database?: string } {
  const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!url?.trim()) {
    return { configured: false };
  }
  try {
    const withoutQuery = url.split('?')[0];
    const match = withoutQuery.match(/@([^/?]+)(?:\/([^/?]+))?$/i);
    if (!match) {
      return { configured: true };
    }
    const hostPort = match[1];
    const host = hostPort.split(':')[0];
    const database = match[2];
    return { configured: true, host, database };
  } catch {
    return { configured: true };
  }
}

/**
 * Logs non-secret environment summary on server startup (after loadEnv).
 */
export function logStartupEnvironment(): void {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const db = describeDatabaseForLog();
  const payload = {
    nodeEnv,
    staging: isStaging(),
    development: isDevelopment(),
    databaseConfigured: db.configured,
    databaseHost: db.host ?? null,
    databaseName: db.database ?? null,
    port: process.env.PORT ?? null,
    ts: Date.now(),
  };
  console.log('[startup:environment]', JSON.stringify(payload));
}
