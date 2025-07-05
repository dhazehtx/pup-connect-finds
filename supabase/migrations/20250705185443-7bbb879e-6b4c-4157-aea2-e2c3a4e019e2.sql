
-- Add new columns to dog_listings table for enhanced dog information
ALTER TABLE public.dog_listings 
ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('Male', 'Female', 'Unknown')),
ADD COLUMN IF NOT EXISTS size text CHECK (size IN ('Small', 'Medium', 'Large')),
ADD COLUMN IF NOT EXISTS color text,
ADD COLUMN IF NOT EXISTS vaccinated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS neutered_spayed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS good_with_kids boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS good_with_dogs boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS special_needs boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS rehoming boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS delivery_available boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS listing_status text CHECK (listing_status IN ('active', 'pending', 'sold', 'expired', 'draft')) DEFAULT 'active';

-- Add indexes for better query performance on commonly filtered columns
CREATE INDEX IF NOT EXISTS idx_dog_listings_gender ON public.dog_listings(gender);
CREATE INDEX IF NOT EXISTS idx_dog_listings_size ON public.dog_listings(size);
CREATE INDEX IF NOT EXISTS idx_dog_listings_color ON public.dog_listings(color);
CREATE INDEX IF NOT EXISTS idx_dog_listings_vaccinated ON public.dog_listings(vaccinated);
CREATE INDEX IF NOT EXISTS idx_dog_listings_neutered_spayed ON public.dog_listings(neutered_spayed);
CREATE INDEX IF NOT EXISTS idx_dog_listings_good_with_kids ON public.dog_listings(good_with_kids);
CREATE INDEX IF NOT EXISTS idx_dog_listings_good_with_dogs ON public.dog_listings(good_with_dogs);
CREATE INDEX IF NOT EXISTS idx_dog_listings_special_needs ON public.dog_listings(special_needs);
CREATE INDEX IF NOT EXISTS idx_dog_listings_rehoming ON public.dog_listings(rehoming);
CREATE INDEX IF NOT EXISTS idx_dog_listings_delivery_available ON public.dog_listings(delivery_available);
CREATE INDEX IF NOT EXISTS idx_dog_listings_listing_status ON public.dog_listings(listing_status);

-- Update existing status column to use listing_status values if needed
-- We'll keep both columns for backward compatibility initially
UPDATE public.dog_listings 
SET listing_status = 
  CASE 
    WHEN status = 'active' THEN 'active'
    WHEN status = 'pending' THEN 'pending' 
    WHEN status = 'sold' THEN 'sold'
    ELSE 'active'
  END
WHERE listing_status IS NULL;
