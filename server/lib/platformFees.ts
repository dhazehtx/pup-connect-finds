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

/**
 * PAWS BREEDER marketplace commission (basis points) on dog-sale protected
 * transactions. Dedicated knob so breeder and service commissions can differ.
 * Falls back to CONNECT_APP_FEE_BPS, then 0 at launch. The legacy escrow's 8% is
 * NOT assumed — the final rate is an owner decision (set BREEDER_PLATFORM_FEE_BPS).
 */
export function getBreederPlatformFeeBps(): number {
  const raw = process.env.BREEDER_PLATFORM_FEE_BPS;
  if (raw !== undefined && raw !== "") {
    const n = parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 0) return Math.min(n, 10000);
  }
  return getConnectAppFeeBps();
}
