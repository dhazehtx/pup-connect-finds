-- NDIS: dogs, microchips, vet verification, dog_sightings, search missions, imported posts, dog_embeddings
-- Plus new columns on lost_pet_alerts and lost_pet_alert_reports

-- 1. Dogs table (dog identity profiles)
CREATE TABLE IF NOT EXISTS dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  breed TEXT,
  color TEXT,
  dog_size TEXT,
  gender TEXT,
  dob TIMESTAMP,
  photo_url TEXT,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vet_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  breeder_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  microchip_number TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Microchips (chip -> dog -> owner for instant match)
CREATE TABLE IF NOT EXISTS microchips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chip_number TEXT NOT NULL UNIQUE,
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vet_registered BOOLEAN DEFAULT FALSE,
  registry_source TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Vet verification (for Verified Veterinary Clinic badge)
CREATE TABLE IF NOT EXISTS vet_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  license_number TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. New columns on lost_pet_alerts (before dog_sightings references it)
ALTER TABLE lost_pet_alerts ADD COLUMN IF NOT EXISTS reunited_at TIMESTAMP;
ALTER TABLE lost_pet_alerts ADD COLUMN IF NOT EXISTS dog_id UUID REFERENCES dogs(id) ON DELETE SET NULL;
ALTER TABLE lost_pet_alerts ADD COLUMN IF NOT EXISTS is_vet_listing BOOLEAN DEFAULT FALSE;
ALTER TABLE lost_pet_alerts ADD COLUMN IF NOT EXISTS vet_verification_id UUID REFERENCES vet_verification(id) ON DELETE SET NULL;
ALTER TABLE lost_pet_alerts ADD COLUMN IF NOT EXISTS intake_date TIMESTAMP;
ALTER TABLE lost_pet_alerts ADD COLUMN IF NOT EXISTS microchip_scan_result TEXT;
ALTER TABLE lost_pet_alerts ADD COLUMN IF NOT EXISTS health_status TEXT;

-- 5. New columns on lost_pet_alert_reports (source platform for Ring/Nextdoor/Facebook)
ALTER TABLE lost_pet_alert_reports ADD COLUMN IF NOT EXISTS source_platform TEXT;
ALTER TABLE lost_pet_alert_reports ADD COLUMN IF NOT EXISTS screenshot_url TEXT;
ALTER TABLE lost_pet_alert_reports ADD COLUMN IF NOT EXISTS seen_at TIMESTAMP;

-- 6. Dog sightings (external sources: Ring, Nextdoor, Facebook)
CREATE TABLE IF NOT EXISTS dog_sightings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES lost_pet_alerts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_platform TEXT NOT NULL,
  screenshot_url TEXT,
  photo_url TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  notes TEXT,
  seen_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Search missions ("Uber for Lost Dogs")
CREATE TABLE IF NOT EXISTS search_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES lost_pet_alerts(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS search_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES search_missions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW()
);

-- 8. Imported posts (from external links)
CREATE TABLE IF NOT EXISTS imported_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_url TEXT NOT NULL,
  imported_by_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_platform TEXT,
  lost_dog_id UUID REFERENCES lost_pet_alerts(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Dog embeddings (face/similarity - placeholder)
CREATE TABLE IF NOT EXISTS dog_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES lost_pet_alerts(id) ON DELETE CASCADE,
  embedding_vector JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dogs_owner ON dogs(owner_id);
CREATE INDEX IF NOT EXISTS idx_microchips_chip ON microchips(chip_number);
CREATE INDEX IF NOT EXISTS idx_dog_sightings_dog ON dog_sightings(dog_id);
CREATE INDEX IF NOT EXISTS idx_search_missions_alert ON search_missions(alert_id);
CREATE INDEX IF NOT EXISTS idx_search_participants_mission ON search_participants(mission_id);
