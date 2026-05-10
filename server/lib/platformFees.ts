/**
 * Central platform fee configuration for launch (default 0%) and future enablement.
 * Set in .env without code changes:
 *   PLATFORM_FEE_PERCENT=0.10     — decimal fraction for /api/payments/create-intent (e.g. 0.10 = 10%)
 *   CONNECT_APP_FEE_BPS=1000      — basis points for listing/deal fee precomputed on deal rows (1000 = 10%)
 */
export function getPlatformFeePercent(): number {
  const raw = process.env.PLATFORM_FEE_PERCENT;
  if (raw === undefined || raw === "") return 0;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** Application fee on Connect destination charges (basis points). Default 0 at launch. */
export function getConnectAppFeeBps(): number {
  const raw = process.env.CONNECT_APP_FEE_BPS;
  if (raw === undefined || raw === "") return 0;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
