-- Optional stud / listing detail fields on pet service providers
ALTER TABLE pet_service_providers
  ADD COLUMN IF NOT EXISTS dog_name TEXT,
  ADD COLUMN IF NOT EXISTS breed TEXT,
  ADD COLUMN IF NOT EXISTS age TEXT,
  ADD COLUMN IF NOT EXISTS stud_method TEXT,
  ADD COLUMN IF NOT EXISTS images TEXT[];

COMMENT ON COLUMN pet_service_providers.stud_method IS 'live | shipped | both — relevant when service_type = stud_services';
