-- Multi-service provider offerings: optional fields + one row per (user_id, service_type)

ALTER TABLE public.pet_service_providers
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS boarding_capacity TEXT,
  ADD COLUMN IF NOT EXISTS drivers_license TEXT;

-- Remove duplicate rows for the same user + service (keep newest by created_at)
DELETE FROM public.pet_service_providers a
WHERE EXISTS (
  SELECT 1
  FROM public.pet_service_providers b
  WHERE b.user_id = a.user_id
    AND b.service_type = a.service_type
    AND b.created_at > a.created_at
);

CREATE UNIQUE INDEX IF NOT EXISTS pet_service_providers_user_service_uidx
  ON public.pet_service_providers (user_id, service_type);
