-- Add is_admin field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Set danieluke97 as admin
UPDATE profiles 
SET is_admin = TRUE 
WHERE username = 'danieluke97' OR email = 'danieluke97@yahoo.com';

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);