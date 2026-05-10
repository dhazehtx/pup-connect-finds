-- Lost & Found: allow alerts to be "lost" (owner looking) or "found" (someone found a pet)
ALTER TABLE lost_pet_alerts ADD COLUMN IF NOT EXISTS alert_type TEXT DEFAULT 'lost';
UPDATE lost_pet_alerts SET alert_type = 'lost' WHERE alert_type IS NULL;
