
-- Create subscription tiers enum if not exists
DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'provider', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create service provider roles enum if not exists
DO $$ BEGIN
    CREATE TYPE service_type AS ENUM ('grooming', 'walking', 'training', 'veterinary', 'boarding', 'sitting');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update subscribers table to include premium features tracking
DO $$ BEGIN
    ALTER TABLE public.subscribers 
    ADD COLUMN features_enabled JSONB DEFAULT '{"early_access": false, "matchmaker": false, "priority_support": false, "verified_badge": false}'::jsonb;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.subscribers 
    ADD COLUMN tier subscription_tier DEFAULT 'free';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Create service providers table if not exists
CREATE TABLE IF NOT EXISTS public.service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  service_types service_type[] NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  pricing JSONB DEFAULT '{}',
  availability JSONB DEFAULT '{}',
  stripe_connect_account_id TEXT,
  commission_rate DECIMAL DEFAULT 0.15,
  rating DECIMAL DEFAULT 0.0,
  total_bookings INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create ads table for in-app advertising
CREATE TABLE IF NOT EXISTS public.advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  target_page TEXT NOT NULL,
  advertiser_name TEXT NOT NULL,
  click_url TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  daily_budget DECIMAL,
  total_impressions INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create ad impressions tracking
CREATE TABLE IF NOT EXISTS public.ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES public.advertisements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page_url TEXT,
  clicked BOOLEAN DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create subscription boxes table
CREATE TABLE IF NOT EXISTS public.subscription_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  box_size TEXT NOT NULL CHECK (box_size IN ('small', 'medium', 'large')),
  dog_age_range TEXT NOT NULL CHECK (dog_age_range IN ('puppy', 'adult', 'senior')),
  dietary_preferences JSONB DEFAULT '[]',
  delivery_frequency TEXT DEFAULT 'monthly' CHECK (delivery_frequency IN ('monthly', 'bi-monthly', 'quarterly')),
  monthly_price DECIMAL NOT NULL,
  next_delivery_date DATE,
  shipping_address JSONB NOT NULL,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create box deliveries table
CREATE TABLE IF NOT EXISTS public.box_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscription_boxes(id) ON DELETE CASCADE,
  delivery_date DATE NOT NULL,
  tracking_number TEXT,
  contents JSONB DEFAULT '[]',
  status TEXT DEFAULT 'preparing' CHECK (status IN ('preparing', 'shipped', 'delivered', 'skipped')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create premium usage tracking
CREATE TABLE IF NOT EXISTS public.premium_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on new tables (ignore errors if already enabled)
DO $$ BEGIN
    ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.box_deliveries ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.premium_usage ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

-- Create RLS Policies (ignore if they already exist)
DO $$ BEGIN
    CREATE POLICY "Users can view all service providers" ON public.service_providers FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can create their own provider profile" ON public.service_providers FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update their own provider profile" ON public.service_providers FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Anyone can view active ads" ON public.advertisements FOR SELECT USING (status = 'active' AND starts_at <= now() AND ends_at >= now());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can view their own box deliveries" ON public.box_deliveries FOR SELECT USING (auth.uid() IN (SELECT user_id FROM subscription_boxes WHERE id = subscription_id));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can view their own usage" ON public.premium_usage FOR ALL USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes (ignore if they already exist)
CREATE INDEX IF NOT EXISTS idx_service_providers_location ON public.service_providers USING gin(to_tsvector('english', location));
CREATE INDEX IF NOT EXISTS idx_service_providers_service_types ON public.service_providers USING gin(service_types);
CREATE INDEX IF NOT EXISTS idx_ads_page_active ON public.advertisements(target_page) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_ad_impressions_ad_date ON public.ad_impressions(ad_id, created_at);
