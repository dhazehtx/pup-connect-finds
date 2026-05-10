-- Whelping safety guardrails + waitlist deposit flow

CREATE TABLE IF NOT EXISTS public.whelping_provider_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL UNIQUE REFERENCES public.pet_service_providers(id) ON DELETE CASCADE,
  years_experience INTEGER NOT NULL,
  has_breeding_license BOOLEAN NOT NULL DEFAULT FALSE,
  has_secure_whelping_space BOOLEAN NOT NULL DEFAULT FALSE,
  theft_prevention_plan TEXT NOT NULL,
  welfare_commitment_ack BOOLEAN NOT NULL DEFAULT FALSE,
  legal_compliance_ack BOOLEAN NOT NULL DEFAULT FALSE,
  background_check_ack BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.whelping_waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.pet_service_providers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  expected_litter_date TIMESTAMPTZ,
  puppy_preference TEXT,
  notes TEXT,
  deposit_amount NUMERIC(10,2) NOT NULL,
  deposit_status TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  policy_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_whelping_waitlist_provider_user UNIQUE (provider_id, user_id)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'whelping_waitlist_entries_deposit_status_check'
  ) THEN
    ALTER TABLE public.whelping_waitlist_entries
      ADD CONSTRAINT whelping_waitlist_entries_deposit_status_check
      CHECK (deposit_status IN ('pending', 'paid', 'refunded'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'whelping_waitlist_entries_status_check'
  ) THEN
    ALTER TABLE public.whelping_waitlist_entries
      ADD CONSTRAINT whelping_waitlist_entries_status_check
      CHECK (status IN ('pending', 'approved', 'rejected', 'withdrew'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS whelping_waitlist_entries_provider_idx
  ON public.whelping_waitlist_entries(provider_id);
CREATE INDEX IF NOT EXISTS whelping_waitlist_entries_user_idx
  ON public.whelping_waitlist_entries(user_id);
CREATE INDEX IF NOT EXISTS whelping_waitlist_entries_checkout_session_idx
  ON public.whelping_waitlist_entries(stripe_checkout_session_id);
