import {
  IS_PROD,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
} from './config';

/**
 * Staging must use test keys and a webhook secret from the same Stripe mode (test dashboard).
 * Uses the same resolution rules as `config.ts` (STRIPE_*_TEST fallbacks when not on live path).
 */
export function validateStripeEnvironment(): void {
  if (process.env.NODE_ENV !== 'staging') return;

  const sk = STRIPE_SECRET_KEY?.trim();
  if (!sk) {
    console.warn(
      '[stripe] STAGING: No Stripe secret key resolved — set STRIPE_SECRET_KEY_TEST or STRIPE_SECRET_KEY (sk_test_...) for staging.',
    );
  } else if (sk.startsWith('sk_live_')) {
    throw new Error(
      '[stripe] STAGING: Use Stripe test secret keys only (sk_test_...). Live keys are not allowed when NODE_ENV=staging.',
    );
  }

  const wh = STRIPE_WEBHOOK_SECRET?.trim();
  if (!wh) {
    console.warn(
      '[stripe] STAGING: No webhook signing secret resolved — set STRIPE_WEBHOOK_SECRET_TEST or STRIPE_WEBHOOK_SECRET (test `whsec_...`) for staging.',
    );
  }
}

/**
 * Logs Stripe mode at startup (test vs live path, key prefix, webhook secret presence).
 * Does not print secret values.
 */
export function logStripeStartup(): void {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const rawSk = process.env.STRIPE_SECRET_KEY?.trim() ?? '';
  let secretKeyMode: 'live' | 'test' | 'unset' | 'other' = 'unset';
  if (rawSk.startsWith('sk_live_')) secretKeyMode = 'live';
  else if (rawSk.startsWith('sk_test_')) secretKeyMode = 'test';
  else if (rawSk) secretKeyMode = 'other';

  const resolvedSk = STRIPE_SECRET_KEY?.trim() ?? '';
  let resolvedMode: 'live' | 'test' | 'unset' | 'other' = 'unset';
  if (resolvedSk.startsWith('sk_live_')) resolvedMode = 'live';
  else if (resolvedSk.startsWith('sk_test_')) resolvedMode = 'test';
  else if (resolvedSk) resolvedMode = 'other';

  console.info(
    '[stripe:startup]',
    JSON.stringify({
      nodeEnv,
      configResolvedLiveKeyPath: IS_PROD,
      envSecretKeyMode: secretKeyMode,
      configResolvedSecretKeyMode: resolvedMode,
      webhookSecretPresent: Boolean(STRIPE_WEBHOOK_SECRET?.trim()),
    }),
  );
}
