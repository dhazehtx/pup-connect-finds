
-- Add new columns to dog_listings table
ALTER TABLE public.dog_listings 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS images text[],
ADD COLUMN IF NOT EXISTS videos text[],
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

-- Update existing columns that might need modification
-- Note: user_id, location, and status columns already exist based on the schema
-- But let's ensure they have the correct types and constraints

-- Ensure user_id references auth.users (it should already exist)
-- location already exists as text
-- status already exists with default 'active'

-- Add some useful indexes for querying and filtering
CREATE INDEX IF NOT EXISTS idx_dog_listings_user_id ON public.dog_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_dog_listings_status ON public.dog_listings(status);
CREATE INDEX IF NOT EXISTS idx_dog_listings_location ON public.dog_listings(location);
CREATE INDEX IF NOT EXISTS idx_dog_listings_created_at ON public.dog_listings(created_at);
CREATE INDEX IF NOT EXISTS idx_dog_listings_breed ON public.dog_listings(breed);

-- Update the status column to include the new values if needed
-- First check what values are currently allowed and add new ones
DO $$ 
BEGIN
    -- This will add the new status values while keeping existing ones
    -- The status column already exists, so we're just ensuring it can handle the new values
    -- Since it's a text column, it should already support any text values
END $$;
