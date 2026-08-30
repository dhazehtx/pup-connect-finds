-- =============================================================================
-- Deals — breeder protected-payment tables (payment cutover prerequisite).
-- =============================================================================
-- Production (verified 2026-08-30 by read-only introspection) has NO deals
-- tables at all, but the authoritative breeder flow at 0a6862b
-- (server/routes/deals.ts + the canonical Stripe webhook) requires them.
-- This DDL is generated from the repository's authoritative Drizzle schema
-- (shared/schema.ts: deals, deal_payments, deal_payouts, deal_disputes) and the
-- exact queries the code performs.
--
-- Access model: SERVER-ONLY. All reads/writes go through the Express API
-- (/api/deals) over the privileged database connection; no client-side
-- supabase-js access to these tables exists in the codebase. RLS is therefore
-- enabled with NO client policies and client-role privileges are revoked —
-- the same server-only model as the stripe webhook tables.
--
-- Additive + idempotent (IF NOT EXISTS). No destructive statements, no data
-- backfill. FK targets (profiles, dog_listings) already exist in production.
--
-- OWNER ACTION REQUIRED: apply to production (wneticxjhxpjpfghnclr) via the
-- Supabase SQL Editor. Prepared as a reviewed candidate; agents never run remote
-- migrations.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.deals (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id          uuid NOT NULL REFERENCES public.dog_listings(id),
  buyer_id            uuid NOT NULL REFERENCES public.profiles(id),
  seller_id           uuid NOT NULL REFERENCES public.profiles(id),
  total_price_cents   integer NOT NULL,
  deposit_cents       integer NOT NULL,
  balance_cents       integer NOT NULL,
  platform_fee_cents  integer NOT NULL DEFAULT 0,
  status              text NOT NULL DEFAULT 'DRAFT',
  handoff_code        text,
  reserved_until      timestamptz,
  delivered_at        timestamptz,
  confirmed_at        timestamptz,
  dispute_window_ends timestamptz,
  released_at         timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.deal_payments (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id                  uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  kind                     text NOT NULL,                -- 'DEPOSIT' | 'BALANCE'
  stripe_payment_intent_id text UNIQUE,                  -- webhook updates by PI id
  amount_cents             integer NOT NULL,
  status                   text NOT NULL DEFAULT 'pending',
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.deal_payouts (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id            uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  stripe_transfer_id text UNIQUE,                        -- release upserts ON CONFLICT (stripe_transfer_id)
  seller_account_id  text NOT NULL,
  amount_cents       integer NOT NULL,
  status             text NOT NULL DEFAULT 'pending',    -- 'completed' | 'failed'
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.deal_disputes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id     uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  opened_by   uuid NOT NULL REFERENCES public.profiles(id),
  reason      text NOT NULL,
  description text,
  status      text NOT NULL DEFAULT 'open',
  resolution  text,
  resolved_by uuid REFERENCES public.profiles(id),
  resolved_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Indexes for the queries the code actually runs.
CREATE INDEX IF NOT EXISTS idx_deals_listing_id   ON public.deals(listing_id);   -- duplicate-active-deal check
CREATE INDEX IF NOT EXISTS idx_deals_buyer_id     ON public.deals(buyer_id);     -- buyer deal list
CREATE INDEX IF NOT EXISTS idx_deals_seller_id    ON public.deals(seller_id);    -- seller deal list
CREATE INDEX IF NOT EXISTS idx_deals_status       ON public.deals(status);       -- admin filter / auto-release scan
CREATE INDEX IF NOT EXISTS idx_deal_payments_deal_id ON public.deal_payments(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_payouts_deal_id  ON public.deal_payouts(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_disputes_deal_id ON public.deal_disputes(deal_id);

-- Server-only access: RLS on, NO client policies, no client-role privileges.
ALTER TABLE public.deals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_payouts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_disputes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.deals, public.deal_payments, public.deal_payouts, public.deal_disputes
  FROM anon, authenticated;

-- =============================================================================
-- VERIFICATION (run after applying — read-only)
--   SELECT table_name FROM information_schema.tables
--    WHERE table_schema='public'
--      AND table_name IN ('deals','deal_payments','deal_payouts','deal_disputes')
--    ORDER BY table_name;                                   -- expect 4 rows
--   SELECT relname, relrowsecurity FROM pg_class
--    WHERE relname IN ('deals','deal_payments','deal_payouts','deal_disputes');  -- all t
-- =============================================================================
