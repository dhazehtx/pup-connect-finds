/** Resolved after `loadEnv()` runs in `server/index.ts` (and any script that calls `loadEnv()` first). */

export function getNodeEnv(): string {
  return process.env.NODE_ENV || 'development';
}

export function isDevelopment(): boolean {
  return getNodeEnv() === 'development';
}

export function isStaging(): boolean {
  return getNodeEnv() === 'staging';
}

export function isProduction(): boolean {
  return getNodeEnv() === 'production';
}

/** True when the app should behave like a deployed instance (not local dev). */
export function isNonDevelopment(): boolean {
  return isStaging() || isProduction();
}
