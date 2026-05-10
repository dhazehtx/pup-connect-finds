import Stripe from 'stripe';

const API_VERSION = '2025-08-27.basil' as any;

/**
 * Resolves secret key. Falls back to the same placeholder as `stripe/connect.ts` so
 * `new Stripe()` never receives `undefined` / empty string (Stripe SDK throws).
 * Local dev without `.env` can still boot; real payments need STRIPE_SECRET_KEY set.
 */
function resolveSecretKey(): string {
  const k = process.env.STRIPE_SECRET_KEY?.trim();
  if (k) return k;
  return 'sk_test_mock_key';
}

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (!cached) {
    cached = new Stripe(resolveSecretKey(), { apiVersion: API_VERSION });
  }
  return cached;
}
