-- Create Lost & Found pet alerts table (run this before 20260321 and 20260322)
CREATE TABLE IF NOT EXISTS lost_pet_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  alert_type TEXT DEFAULT 'lost',
  pet_name TEXT,
  species TEXT DEFAULT 'dog',
  breed TEXT,
  description TEXT,
  image_url TEXT,
  last_seen_address TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  contact_info TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
