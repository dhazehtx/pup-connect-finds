-- =============================================================================
-- Service-provider booking payments — add payment/payout columns.
-- =============================================================================
-- Backs the authoritative service-payment flow (separate charges + transfers):
-- server/lib/serviceBookingPayments.ts, routes/serviceBookingPayments.ts, and the
-- canonical Stripe webhook. Amounts/commission are server-computed; the payout is
-- transferred to the provider's Connect account (providers.stripe_account_id),
-- derived from service_bookings -> pet_service_providers.user_id -> providers.
--
-- Additive/idempotent (ADD COLUMN IF NOT EXISTS). No data migration, no changes to
-- other tables. Until applied, the service-payment routes fail safe (queries error
-- on the missing columns and return a 500 without moving money).
--
-- OWNER ACTION REQUIRED: apply to production (wneticxjhxpjpfghnclr) via the
-- Supabase SQL Editor. Prepared as a reviewed candidate; agents never run remote
-- migrations. Also set CONNECT_APP_FEE_BPS (Railway) to the chosen marketplace
-- commission — default 0 (no fee) until the owner selects the final percentage.
-- =============================================================================

ALTER TABLE public.service_bookings
  ADD COLUMN IF NOT EXISTS amount_cents            integer,
  ADD COLUMN IF NOT EXISTS currency                text DEFAULT 'usd',
  ADD COLUMN IF NOT EXISTS platform_fee_cents      integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS provider_amount_cents   integer,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS payment_status          text DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS stripe_transfer_id      text,
  ADD COLUMN IF NOT EXISTS payout_status           text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS completed_by            text,
  ADD COLUMN IF NOT EXISTS paid_at                 timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at            timestamptz,
  ADD COLUMN IF NOT EXISTS released_at             timestamptz;

CREATE INDEX IF NOT EXISTS idx_service_bookings_payment_intent
  ON public.service_bookings(stripe_payment_intent_id);

-- =============================================================================
-- VERIFICATION (run after applying)
--   SELECT column_name FROM information_schema.columns
--     WHERE table_name = 'service_bookings' AND column_name = 'payout_status';   -- 1 row
-- =============================================================================
