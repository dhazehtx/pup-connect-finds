
-- Create donations table to track donation payments
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  stripe_session_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create promotions table to track listing promotions
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL,
  tier_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  duration_days INTEGER NOT NULL,
  stripe_session_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Create policies for donations (public readable for transparency, edge functions can write)
CREATE POLICY "donations_select_all" ON public.donations
  FOR SELECT USING (true);

CREATE POLICY "donations_insert_system" ON public.donations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "donations_update_system" ON public.donations
  FOR UPDATE USING (true);

-- Create policies for promotions (users can view all, edge functions can write)
CREATE POLICY "promotions_select_all" ON public.promotions
  FOR SELECT USING (true);

CREATE POLICY "promotions_insert_system" ON public.promotions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "promotions_update_system" ON public.promotions
  FOR UPDATE USING (true);

-- Add foreign key reference to dog_listings for promotions
ALTER TABLE public.promotions 
ADD CONSTRAINT fk_promotions_listing 
FOREIGN KEY (listing_id) REFERENCES public.dog_listings(id) ON DELETE CASCADE;
