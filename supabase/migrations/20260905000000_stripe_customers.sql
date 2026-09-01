-- =============================================================================
-- stripe_customers — user_id ↔ Stripe Customer binding (P1 checkout repair).
-- =============================================================================
-- Production introspection (2026-09-01, read-only) found this table MISSING.
-- Subscription-mode checkout (Pup Box monthly), Deals deposits, and membership
-- checkout all call getOrCreateStripeCustomer(userId) -> SELECT ... FROM
-- stripe_customers, so the missing relation threw and surfaced as
-- 500 CHECKOUT_FAILED on POST /api/checkout/session (Pup Box Step-7 E2E).
-- One-time Store checkout never touches this table, which is why it passed.
--
-- Shape matches the authoritative Drizzle schema (shared/schema.ts
-- stripeCustomers): both user_id and stripe_customer_id are UNIQUE — the
-- identity binding that prevents cross-user Stripe-customer reuse.
--
-- Additive/idempotent (IF NOT EXISTS). No data migration, no changes to other
-- tables. Access model: SERVER-ONLY (the server's privileged connection
-- bypasses RLS; clients get no policies and no privileges).
--
-- OWNER ACTION REQUIRED: apply to production (wneticxjhxpjpfghnclr) via the
-- Supabase SQL Editor. Prepared as a reviewed candidate; agents never run remote
-- migrations.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id text NOT NULL UNIQUE,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON public.stripe_customers(user_id);

-- Server-only access: RLS on, NO client policies, no client-role privileges.
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.stripe_customers FROM anon, authenticated;

-- =============================================================================
-- VERIFICATION (run after applying — read-only)
--   SELECT column_name, is_nullable FROM information_schema.columns
--    WHERE table_schema='public' AND table_name='stripe_customers'
--    ORDER BY ordinal_position;                                -- 4 rows
--   SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint
--    WHERE conrelid='public.stripe_customers'::regclass;       -- PK + 2 UNIQUE + FK
--   SELECT relrowsecurity FROM pg_class WHERE relname='stripe_customers';  -- t
-- =============================================================================
