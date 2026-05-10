-- Add optional latitude/longitude for map pins (Lost & Found)
ALTER TABLE lost_pet_alerts ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE lost_pet_alerts ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
