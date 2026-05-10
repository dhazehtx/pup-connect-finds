-- Pet transport listing fields (service_type = transportation)
ALTER TABLE pet_service_providers
  ADD COLUMN IF NOT EXISTS transport_type TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_type TEXT,
  ADD COLUMN IF NOT EXISTS max_distance TEXT;

COMMENT ON COLUMN pet_service_providers.transport_type IS 'local_pickup | long_distance | airport';
