-- Lost & Found: view_count for "Most Viewed" sort
ALTER TABLE lost_pet_alerts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
