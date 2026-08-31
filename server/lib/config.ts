// server/lib/config.ts
//
// Stripe environment/mode resolution. This must resolve to the correct mode on
// the ACTUAL runtime host (Railway/Render/etc.), not depend on Vercel/Next-only
// variables. Precedence:
//   1) explicit STRIPE_MODE = 'live' | 'test'   (authoritative override)
//   2) NODE_ENV === 'production'                 (set by Railway/Render/most hosts)
//   3) legacy NEXT_PUBLIC_APP_ENV / VERCEL_ENV   (back-compat only)
//   4) default 'development'
function resolveAppEnv(): 'production' | 'development' {
  const mode = (process.env.STRIPE_MODE || '').trim().toLowerCase();
  if (mode === 'live' || mode === 'production') return 'production';
  if (mode === 'test' || mode === 'development') return 'development';

  if ((process.env.NODE_ENV || '').trim().toLowerCase() === 'production') return 'production';

  const legacy = (process.env.NEXT_PUBLIC_APP_ENV ?? process.env.VERCEL_ENV ?? '').trim().toLowerCase();
  if (legacy === 'production') return 'production';

  return 'development';
}

export const APP_ENV = resolveAppEnv();
export const IS_PROD = APP_ENV === 'production';

export const STRIPE_PUBLIC_KEY = IS_PROD
  ? (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE || process.env.VITE_STRIPE_PUBLIC_KEY || '')
  : (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST || process.env.VITE_STRIPE_PUBLIC_KEY || '');

export const STRIPE_SECRET_KEY = IS_PROD
  ? (process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY || '')
  : (process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY || '');

export const STRIPE_WEBHOOK_SECRET = IS_PROD
  ? (process.env.STRIPE_WEBHOOK_SECRET_LIVE || process.env.STRIPE_WEBHOOK_SECRET || '')
  : (process.env.STRIPE_WEBHOOK_SECRET_TEST || process.env.STRIPE_WEBHOOK_SECRET || '');

/**
 * OPTIONAL second signing secret for the Stripe Connect webhook destination
 * (scope "Connected accounts", e.g. account.updated). Stripe issues each
 * destination its own signing secret, so the canonical router accepts a valid
 * signature from EITHER the platform secret above OR this one. Additive: when
 * unset, the platform webhook behaves exactly as before and startup is
 * unaffected. Same mode-aware naming convention as the platform secret.
 */
export const STRIPE_CONNECT_WEBHOOK_SECRET = IS_PROD
  ? (process.env.STRIPE_CONNECT_WEBHOOK_SECRET_LIVE || process.env.STRIPE_CONNECT_WEBHOOK_SECRET || '')
  : (process.env.STRIPE_CONNECT_WEBHOOK_SECRET_TEST || process.env.STRIPE_CONNECT_WEBHOOK_SECRET || '');

/**
 * Validate that the resolved Stripe keys match the resolved mode, and never mix a
 * live key with a test key. Returns a list of human-readable problems (empty = OK).
 * Never logs or returns key material.
 */
export function validateStripeKeyMode(): string[] {
  const problems: string[] = [];
  const secret = STRIPE_SECRET_KEY;
  const pub = STRIPE_PUBLIC_KEY;

  if (secret) {
    const secretIsLive = secret.startsWith('sk_live_') || secret.startsWith('rk_live_');
    const secretIsTest = secret.startsWith('sk_test_') || secret.startsWith('rk_test_');
    if (IS_PROD && secretIsTest) {
      problems.push('Production mode resolved but STRIPE_SECRET_KEY is a TEST key (sk_test_…).');
    }
    if (!IS_PROD && secretIsLive) {
      problems.push('Development/test mode resolved but STRIPE_SECRET_KEY is a LIVE key (sk_live_…).');
    }
    if (secret === 'sk_test_mock_key') {
      problems.push('STRIPE_SECRET_KEY is the mock placeholder (sk_test_mock_key) — real payments will fail.');
    }
  }

  if (secret && pub) {
    const secretLive = secret.startsWith('sk_live_') || secret.startsWith('rk_live_');
    const pubLive = pub.startsWith('pk_live_');
    const secretTest = secret.startsWith('sk_test_') || secret.startsWith('rk_test_');
    const pubTest = pub.startsWith('pk_test_');
    if ((secretLive && pubTest) || (secretTest && pubLive)) {
      problems.push('Stripe publishable key and secret key are from different modes (one live, one test).');
    }
  }

  return problems;
}

/**
 * The subset of validateStripeKeyMode() problems that are DANGEROUS enough to
 * refuse startup (fail closed) — cases where we could silently process real
 * money under the wrong environment. Deliberately does NOT include
 * "production mode resolved but the key is a TEST key": that is the intended
 * pre-launch posture (Stripe stays TEST while NODE_ENV=production) and must not
 * block boot. Never returns key material.
 */
export function validateStripeKeyModeFatal(): string[] {
  const fatal: string[] = [];
  const secret = STRIPE_SECRET_KEY;
  const pub = STRIPE_PUBLIC_KEY;
  if (!secret) return fatal;

  const secretIsLive = secret.startsWith('sk_live_') || secret.startsWith('rk_live_');
  const secretIsTest = secret.startsWith('sk_test_') || secret.startsWith('rk_test_');

  // A LIVE key resolved in a test/dev environment would charge real cards while
  // the app believes it is in test — the most dangerous mismatch.
  if (!IS_PROD && secretIsLive) {
    fatal.push('A LIVE Stripe secret key is configured while test/development mode is resolved — refusing to start.');
  }

  // Publishable and secret keys from different Stripe modes (one live, one test).
  if (pub) {
    const pubLive = pub.startsWith('pk_live_');
    const pubTest = pub.startsWith('pk_test_');
    if ((secretIsLive && pubTest) || (secretIsTest && pubLive)) {
      fatal.push('Stripe publishable and secret keys are from different modes (one live, one test) — refusing to start.');
    }
  }

  // Real-money (production) mode with the mock placeholder secret would fail every charge.
  if (IS_PROD && secret === 'sk_test_mock_key') {
    fatal.push('Production mode resolved but STRIPE_SECRET_KEY is the mock placeholder — refusing to start.');
  }

  return fatal;
}

/** True only when a real (non-mock) Stripe secret key is configured. */
export function hasUsableStripeSecret(): boolean {
  const k = STRIPE_SECRET_KEY.trim();
  return Boolean(k) && k !== 'sk_test_mock_key';
}

/** @deprecated Prefer getConnectAppFeeBps() from ./platformFees (env CONNECT_APP_FEE_BPS). */
export const CONNECT_APP_FEE_BPS = Number.parseInt(process.env.CONNECT_APP_FEE_BPS || "0", 10) || 0;

// Hold window before releasing provider payouts (in days)
export const PAYOUT_HOLD_DAYS = 1; // 24h after completion (adjust)
