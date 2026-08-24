import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, IS_PROD } from './config';

const API_VERSION = '2025-08-27.basil' as any;

/**
 * Resolves the Stripe secret key.
 *
 * PRODUCTION fails closed: if no real secret key is configured we throw instead
 * of silently using a mock key (which would make every charge a no-op / error
 * while the UI might report success). Local dev without `.env` may still boot
 * with the mock placeholder so unrelated code paths don't crash on import.
 */
function resolveSecretKey(): string {
  const k = (STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '').trim();
  if (k && k !== 'sk_test_mock_key') return k;

  if (IS_PROD || (process.env.NODE_ENV || '').toLowerCase() === 'production') {
    throw new Error(
      '[stripe] No usable STRIPE_SECRET_KEY configured in production. ' +
        'Refusing to fall back to a mock key. Set STRIPE_SECRET_KEY (or STRIPE_SECRET_KEY_LIVE).',
    );
  }
  return 'sk_test_mock_key';
}

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (!cached) {
    cached = new Stripe(resolveSecretKey(), { apiVersion: API_VERSION });
  }
  return cached;
}
