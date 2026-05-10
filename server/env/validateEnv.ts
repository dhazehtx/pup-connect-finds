/**
 * Startup validation for required environment variables.
 * Logs only safe metadata (no secret values or full connection strings).
 */

function hasTruthy(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

export type EnvValidationIssue = {
  /** Stable id for logs and dashboards */
  id: string;
  /** Which env var(s) to set — names only, never values */
  configure: string;
};

export type EnvValidationResult =
  | { ok: true }
  | { ok: false; issues: EnvValidationIssue[] };

function collectIssues(): EnvValidationIssue[] {
  const issues: EnvValidationIssue[] = [];

  if (!hasTruthy('DATABASE_URL') && !hasTruthy('NEON_DATABASE_URL')) {
    issues.push({
      id: 'database_url',
      configure: 'DATABASE_URL or NEON_DATABASE_URL',
    });
  }

  if (!hasTruthy('SUPABASE_URL') && !hasTruthy('VITE_SUPABASE_URL')) {
    issues.push({
      id: 'supabase_url',
      configure: 'SUPABASE_URL or VITE_SUPABASE_URL',
    });
  }

  if (!hasTruthy('SUPABASE_SERVICE_ROLE_KEY')) {
    issues.push({
      id: 'supabase_service_role',
      configure: 'SUPABASE_SERVICE_ROLE_KEY',
    });
  }

  return issues;
}

/**
 * Ensures required environment variables are present after `loadEnv()`.
 * @throws Error with a message that lists only variable names / hints, never secret values.
 */
export function validateEnv(): void {
  const issues = collectIssues();

  if (issues.length === 0) {
    console.log(
      '[env:validation]',
      JSON.stringify({
        ok: true,
        timestamp: new Date().toISOString(),
        checked: ['database_url', 'supabase_url', 'supabase_service_role'],
      }),
    );
    return;
  }

  const payload = {
    ok: false,
    timestamp: new Date().toISOString(),
    missingIds: issues.map((i) => i.id),
    configure: issues.map((i) => i.configure),
  };

  console.error('[env:validation]', JSON.stringify(payload));

  const hint = issues.map((i) => i.configure).join('; ');
  throw new Error(
    `[env] Missing required environment variables. Set: ${hint}. See .env.example.`,
  );
}

/** Non-throwing check — useful for tests or health diagnostics (still no secrets). */
export function getEnvValidationStatus(): EnvValidationResult {
  const issues = collectIssues();
  if (issues.length === 0) return { ok: true };
  return { ok: false, issues };
}
