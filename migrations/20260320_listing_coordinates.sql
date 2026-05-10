-- Optional lat/lng on listings for distance-based sort
ALTER TABLE dog_listings ADD COLUMN IF NOT EXISTS latitude TEXT;
ALTER TABLE dog_listings ADD COLUMN IF NOT EXISTS longitude TEXT;
