-- Align with shared/schema.ts. Neon may have `pet_service_providers` as a VIEW (legacy Supabase/Drizzle drift).
-- Views cannot be ALTERed like tables; missing columns → errorMissingColumn in /api/services/search.

-- 1) If it's a VIEW, drop it so we can use a real TABLE (CASCADE removes dependent objects tied to the view name).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.views
    WHERE table_schema = 'public' AND table_name = 'pet_service_providers'
  ) THEN
    DROP VIEW public.pet_service_providers CASCADE;
  END IF;
END $$;

-- 2) Legacy plural column on a TABLE (not view): rename if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pet_service_providers' AND column_name = 'service_types'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pet_service_providers' AND column_name = 'service_type'
  ) THEN
    ALTER TABLE public.pet_service_providers RENAME COLUMN service_types TO service_type;
  END IF;
END $$;

-- 3) Create base table if missing (after view drop, or fresh DB)
CREATE TABLE IF NOT EXISTS public.pet_service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL DEFAULT 'grooming',
  bio TEXT,
  price NUMERIC(10, 2),
  availability TEXT,
  location TEXT,
  dog_name TEXT,
  breed TEXT,
  age TEXT,
  stud_method TEXT,
  images TEXT[],
  transport_type TEXT,
  vehicle_type TEXT,
  max_distance TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  verification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4) Backfill columns on older TABLEs (no-op if already present)
ALTER TABLE public.pet_service_providers ADD COLUMN IF NOT EXISTS service_type TEXT;
ALTER TABLE public.pet_service_providers ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.pet_service_providers ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2);
ALTER TABLE public.pet_service_providers ADD COLUMN IF NOT EXISTS availability TEXT;
ALTER TABLE public.pet_service_providers ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.pet_service_providers ADD COLUMN IF NOT EXISTS dog_name TEXT;
ALTER TABLE public.pet_service_providers ADD COLUMN IF NOT EXISTS breed TEXT;
ALTER TABLE public.pet_service_providers ADD COLUMN IF NOT EXISTS age TEXT;
ALTER TABLE public.pet_service_providers ADD COLUMN IF NOT EXISTS stud_method TEXT;
ALTER TABLE public.pet_service_providers ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE public.pet_service_providers ADD COLUMN IF NOT EXISTS transport_type TEXT;
ALTER TABLE public.pet_service_providers ADD COLUMN IF NOT EXISTS vehicle_type TEXT;
ALTER TABLE public.pet_service_providers ADD COLUMN IF NOT EXISTS max_distance TEXT;
ALTER TABLE public.pet_service_providers ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.pet_service_providers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.pet_service_providers ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
ALTER TABLE public.pet_service_providers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.pet_service_providers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.pet_service_providers SET service_type = 'grooming' WHERE service_type IS NULL;

CREATE INDEX IF NOT EXISTS pet_service_providers_user_id_idx ON public.pet_service_providers(user_id);
