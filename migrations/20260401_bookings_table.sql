-- Service bookings table required by server/routes/services.ts
-- Safe to run multiple times.

CREATE TABLE IF NOT EXISTS public.service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.pet_service_providers(id) ON DELETE CASCADE,
  service_date TIMESTAMPTZ NOT NULL,
  duration_hours NUMERIC(5, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  special_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.service_bookings
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.service_bookings
  ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES public.pet_service_providers(id) ON DELETE CASCADE;
ALTER TABLE public.service_bookings
  ADD COLUMN IF NOT EXISTS service_date TIMESTAMPTZ;
ALTER TABLE public.service_bookings
  ADD COLUMN IF NOT EXISTS duration_hours NUMERIC(5, 2);
ALTER TABLE public.service_bookings
  ADD COLUMN IF NOT EXISTS total_price NUMERIC(10, 2);
ALTER TABLE public.service_bookings
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.service_bookings
  ADD COLUMN IF NOT EXISTS special_instructions TEXT;
ALTER TABLE public.service_bookings
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.service_bookings
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Normalize status values for current API contract.
UPDATE public.service_bookings
SET status = 'accepted'
WHERE status = 'confirmed';

-- Enforce current status domain while allowing historical rows.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'service_bookings_status_check'
  ) THEN
    ALTER TABLE public.service_bookings
      ADD CONSTRAINT service_bookings_status_check
      CHECK (status IN ('pending', 'accepted', 'rejected', 'completed'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS service_bookings_user_id_idx ON public.service_bookings (user_id);
CREATE INDEX IF NOT EXISTS service_bookings_provider_id_idx ON public.service_bookings (provider_id);
CREATE INDEX IF NOT EXISTS service_bookings_created_at_idx ON public.service_bookings (created_at DESC);
