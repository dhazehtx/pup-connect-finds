-- =============================================================================
-- PAWS MEMBERSHIP table (paid account tier / entitlements).
-- =============================================================================
-- Backs the membership subscription system (server/lib/entitlements.ts,
-- membershipSync.ts, routes/membership.ts). Deliberately SEPARATE from the
-- `subscriptions` table (Pup Box product subscriptions) so the two domains never
-- cross. State is written ONLY by the server (canonical Stripe webhook) — clients
-- never write it; entitlement is read server-side.
--
-- Additive/idempotent (IF NOT EXISTS). No data migration, no changes to other
-- tables. Until this is applied, the membership code fails safe (queries catch
-- the missing relation and treat the user as not entitled).
--
-- OWNER ACTION REQUIRED: apply to production (wneticxjhxpjpfghnclr) via the
-- Supabase SQL Editor. Prepared as a reviewed candidate; agents never run remote
-- migrations. Also create the TEST Stripe Prices and set the env vars
-- STRIPE_PRICE_MEMBERSHIP_PRO_MONTHLY / STRIPE_PRICE_MEMBERSHIP_BUSINESS_MONTHLY
-- (see server/lib/membershipPlans.ts) before membership checkout can transact.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.memberships (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id     text NOT NULL,
  stripe_subscription_id text UNIQUE,
  stripe_price_id        text,
  tier                   text NOT NULL,
  status                 text NOT NULL DEFAULT 'incomplete',
  cancel_at_period_end   boolean NOT NULL DEFAULT false,
  current_period_end     timestamptz,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_stripe_subscription_id ON public.memberships(stripe_subscription_id);

-- RLS: server-only writes. The server uses a privileged connection (bypasses RLS);
-- clients get NO insert/update/delete policy. A user may read their own row only.
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own membership" ON public.memberships;
CREATE POLICY "Users can read their own membership"
  ON public.memberships FOR SELECT
  USING (auth.uid() = user_id);

-- No client-role write privileges (entitlement can never be self-granted).
REVOKE INSERT, UPDATE, DELETE ON public.memberships FROM anon, authenticated;

-- =============================================================================
-- VERIFICATION (run after applying)
--   SELECT relrowsecurity FROM pg_class WHERE relname = 'memberships';           -- t
--   SELECT polcmd, polname FROM pg_policy p JOIN pg_class c ON c.oid = p.polrelid
--     WHERE c.relname = 'memberships';                                           -- only SELECT policy
-- =============================================================================
