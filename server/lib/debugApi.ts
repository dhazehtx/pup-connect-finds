/**
 * Verbose API trace logs ([PROOF:*], etc.).
 * - Development: enabled by default.
 * - Production: only when DEBUG_API=1 or DEBUG_API=true.
 */
export function debugApiEnabled(): boolean {
  if (process.env.NODE_ENV !== 'production') return true;
  const v = process.env.DEBUG_API;
  return v === '1' || v === 'true';
}

export function debugApiLog(...args: unknown[]): void {
  if (debugApiEnabled()) console.log(...args);
}

export function debugApiWarn(...args: unknown[]): void {
  if (debugApiEnabled()) console.warn(...args);
}
