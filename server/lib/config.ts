// server/lib/config.ts
export const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV ?? (process.env.VERCEL_ENV ?? 'development');
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

export const CONNECT_APP_FEE_BPS = 1000; // 10% platform fee (adjust)

// Hold window before releasing provider payouts (in days)
export const PAYOUT_HOLD_DAYS = 1; // 24h after completion (adjust)