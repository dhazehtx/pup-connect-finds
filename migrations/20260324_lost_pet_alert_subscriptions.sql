-- Auto Alert System: user subscriptions for lost/found alerts by location and breed
CREATE TABLE IF NOT EXISTS lost_pet_alert_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  breed TEXT,
  radius_miles INTEGER NOT NULL DEFAULT 10,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lost_pet_alert_subs_user ON lost_pet_alert_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_lost_pet_alert_subs_location ON lost_pet_alert_subscriptions(latitude, longitude);
