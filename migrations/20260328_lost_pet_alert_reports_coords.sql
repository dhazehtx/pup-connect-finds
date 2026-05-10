-- Sightings heatmap: store coordinates for sighted_location reports
ALTER TABLE lost_pet_alert_reports ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE lost_pet_alert_reports ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
