-- Lost & Found: filters and reward (My Pup structure)
ALTER TABLE lost_pet_alerts ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE lost_pet_alerts ADD COLUMN IF NOT EXISTS reward_offered BOOLEAN DEFAULT FALSE;
ALTER TABLE lost_pet_alerts ADD COLUMN IF NOT EXISTS dog_size TEXT;
ALTER TABLE lost_pet_alerts ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE lost_pet_alerts ADD COLUMN IF NOT EXISTS gender TEXT;
