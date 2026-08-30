-- =============================================================================
-- Providers — Stripe Connect capability columns (payment cutover prerequisite).
-- =============================================================================
-- Production `public.providers` (verified 2026-08-30 by read-only introspection)
-- has stripe_account_id + stripe_connected but NONE of the capability columns the
-- payment code at 0a6862b reads/writes:
--   * charges_enabled / payouts_enabled — read by the service payout resolver
--     (server/lib/serviceBookingPayments.ts) and the Deals release helper
--     (server/routes/deals.ts); written by the account.updated webhook
--     (server/lib/stripe-handlers.ts upsertProviderStatus) and payout/status.ts.
--   * requirements_due / onboarding_status / payout_setup_complete /
--     onboarding_last_checked_at / updated_at — written by the same paths
--     (production even lacks updated_at, so those UPDATEs would error today).
--   * background_check_status — read by the verified-badge check (badges.ts).
--
-- All additions are additive + idempotent. Capability fields default FALSE and
-- requirements/status default to a safe "not yet verified" state: we NEVER invent
-- a provider's Stripe capability — real values arrive from Stripe evidence via
-- the account.updated webhook / status refresh. background_check_status is added
-- WITHOUT a default (NULL = unknown; the badge check requires 'passed').
-- `stripe_connected` is intentionally KEPT for compatibility.
--
-- OWNER ACTION REQUIRED: apply to production (wneticxjhxpjpfghnclr) via the
-- Supabase SQL Editor. Prepared as a reviewed candidate; agents never run remote
-- migrations.
-- =============================================================================

ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS charges_enabled            boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS payouts_enabled            boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS requirements_due           jsonb   DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS onboarding_status          text    DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payout_setup_complete      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_last_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS background_check_status    text,
  ADD COLUMN IF NOT EXISTS updated_at                 timestamptz DEFAULT now();

-- The webhook updates providers by Stripe account id.
CREATE INDEX IF NOT EXISTS idx_providers_stripe_account_id
  ON public.providers(stripe_account_id);

-- =============================================================================
-- VERIFICATION (run after applying — read-only)
--   SELECT column_name FROM information_schema.columns
--    WHERE table_schema='public' AND table_name='providers'
--      AND column_name IN ('charges_enabled','payouts_enabled','requirements_due',
--                          'onboarding_status','payout_setup_complete',
--                          'onboarding_last_checked_at','background_check_status','updated_at')
--    ORDER BY column_name;                                   -- expect 8 rows
-- =============================================================================
