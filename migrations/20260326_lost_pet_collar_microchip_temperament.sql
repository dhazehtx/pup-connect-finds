-- Post creation optional fields: collar, microchip, temperament
ALTER TABLE lost_pet_alerts ADD COLUMN IF NOT EXISTS collar_description TEXT;
ALTER TABLE lost_pet_alerts ADD COLUMN IF NOT EXISTS microchip_status TEXT;
ALTER TABLE lost_pet_alerts ADD COLUMN IF NOT EXISTS temperament TEXT;
