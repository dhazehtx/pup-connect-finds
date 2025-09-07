-- Supabase SQL Migration for Stripe Connect
-- Run this once in your Supabase SQL editor

-- Idempotency table
CREATE TABLE IF NOT EXISTS public.stripe_idempotency (
  event_id text primary key,
  created_at timestamptz default now()
);

-- Stripe events audit
CREATE TABLE IF NOT EXISTS public.stripe_events (
  event_id text primary key,
  type text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

-- Providers columns
ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS stripe_account_id text,
  ADD COLUMN IF NOT EXISTS onboarding_status text CHECK (onboarding_status IN ('started','requires_action','verified')) DEFAULT 'started',
  ADD COLUMN IF NOT EXISTS charges_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS payouts_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS requirements_due jsonb DEFAULT '[]'::jsonb;

-- Bookings/Orders columns (adapt table name as needed)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_intent_id text,
  ADD COLUMN IF NOT EXISTS checkout_session_id text;

-- Payouts table
CREATE TABLE IF NOT EXISTS public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  stripe_transfer_id text,
  net_to_provider integer,  -- cents
  app_fee integer,          -- cents
  status text CHECK (status IN ('pending_release','created','failed','reversed','paid')) DEFAULT 'pending_release',
  released_at timestamptz,
  created_at timestamptz DEFAULT now(),
  eligible_at timestamptz,
  error text
);

-- Index for efficient payout release queries
CREATE INDEX IF NOT EXISTS idx_payouts_release
  ON public.payouts (status, eligible_at);

-- Atomic function for setting payout eligibility
CREATE OR REPLACE FUNCTION public.set_payout_eligible_at(p_booking_id uuid, p_hold_seconds integer)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_now timestamptz := now();
BEGIN
  UPDATE public.payouts
    SET eligible_at = v_now + make_interval(secs => p_hold_seconds)
  WHERE booking_id = p_booking_id
    AND status = 'pending_release';
END;
$$;