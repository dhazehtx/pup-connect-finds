/**
 * Deployment tier for logging and Supabase (separate from NODE_ENV-only checks in server/env/nodeEnv).
 */
export type ServerDeploymentEnv = 'development' | 'staging' | 'production';

export function getServerDeploymentEnv(): ServerDeploymentEnv {
  const n = process.env.NODE_ENV || 'development';
  if (n === 'staging') return 'staging';
  if (n === 'production') return 'production';
  return 'development';
}
