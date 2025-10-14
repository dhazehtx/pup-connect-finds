-- Add badges column to profiles table for provider verification badges
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS badges text[] DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN profiles.badges IS 'Array of badge strings like verified_provider, top_seller, etc.';
