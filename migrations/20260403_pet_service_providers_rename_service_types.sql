-- Some databases used column name `service_types`; app + Drizzle expect `service_type`.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pet_service_providers'
      AND column_name = 'service_types'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pet_service_providers'
      AND column_name = 'service_type'
  ) THEN
    ALTER TABLE pet_service_providers RENAME COLUMN service_types TO service_type;
  END IF;
END $$;
