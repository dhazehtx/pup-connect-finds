ALTER TABLE public.provider_applications
  ADD COLUMN IF NOT EXISTS bgcheck_consent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS bgcheck_status TEXT DEFAULT 'not_requested',
  ADD COLUMN IF NOT EXISTS bg_ref_url TEXT;
