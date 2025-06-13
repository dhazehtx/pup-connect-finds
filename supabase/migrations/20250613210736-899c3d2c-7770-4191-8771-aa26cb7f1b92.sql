
-- Create services table for marketplace
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('grooming', 'sitting', 'walking', 'training', 'veterinary', 'boarding')),
  title TEXT NOT NULL,
  description TEXT,
  price_type TEXT NOT NULL CHECK (price_type IN ('hourly', 'flat_rate', 'per_service')),
  price NUMERIC NOT NULL,
  location TEXT,
  availability JSONB DEFAULT '{}',
  service_areas JSONB DEFAULT '[]',
  experience_years INTEGER DEFAULT 0,
  certifications JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending_approval')),
  featured_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service bookings table
CREATE TABLE public.service_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME,
  duration_hours NUMERIC,
  total_amount NUMERIC NOT NULL,
  commission_amount NUMERIC NOT NULL DEFAULT 0,
  commission_rate NUMERIC NOT NULL DEFAULT 0.12,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded')),
  customer_notes TEXT,
  provider_notes TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create PawBox subscriptions table (your own subscription box service)
CREATE TABLE public.pawbox_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('basic', 'premium', 'deluxe')),
  dog_profile JSONB NOT NULL DEFAULT '{}',
  frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'quarterly')),
  price NUMERIC NOT NULL,
  next_delivery_date DATE,
  delivery_address JSONB NOT NULL,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service reviews table
CREATE TABLE public.service_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.service_bookings(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create professional account requests table
CREATE TABLE public.professional_account_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL CHECK (business_type IN ('groomer', 'trainer', 'veterinarian', 'boarder', 'walker', 'sitter')),
  license_number TEXT,
  business_address JSONB,
  years_in_business INTEGER,
  certifications JSONB DEFAULT '[]',
  insurance_info JSONB DEFAULT '{}',
  business_references JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add professional status to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS professional_status TEXT DEFAULT 'standard' CHECK (professional_status IN ('standard', 'professional', 'verified_professional'));

-- Add business info to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS business_info JSONB DEFAULT '{}';

-- Enable RLS on all new tables
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pawbox_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_account_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for services
CREATE POLICY "Anyone can view active services" ON public.services
FOR SELECT USING (status = 'active');

CREATE POLICY "Users can manage their own services" ON public.services
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for service bookings
CREATE POLICY "Users can view their bookings" ON public.service_bookings
FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = provider_id);

CREATE POLICY "Customers can create bookings" ON public.service_bookings
FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Providers and customers can update bookings" ON public.service_bookings
FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = provider_id);

-- RLS Policies for PawBox subscriptions
CREATE POLICY "Users can manage their PawBox subscriptions" ON public.pawbox_subscriptions
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for service reviews
CREATE POLICY "Anyone can view service reviews" ON public.service_reviews
FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their bookings" ON public.service_reviews
FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Reviewers can update their own reviews" ON public.service_reviews
FOR UPDATE USING (auth.uid() = reviewer_id);

-- RLS Policies for professional account requests
CREATE POLICY "Users can manage their professional requests" ON public.professional_account_requests
FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_services_type_location ON public.services(service_type, location);
CREATE INDEX idx_services_user_status ON public.services(user_id, status);
CREATE INDEX idx_service_bookings_dates ON public.service_bookings(booking_date, status);
CREATE INDEX idx_service_reviews_service_rating ON public.service_reviews(service_id, rating);
CREATE INDEX idx_professional_requests_status ON public.professional_account_requests(status);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_bookings_updated_at BEFORE UPDATE ON public.service_bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pawbox_subscriptions_updated_at BEFORE UPDATE ON public.pawbox_subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_reviews_updated_at BEFORE UPDATE ON public.service_reviews
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professional_requests_updated_at BEFORE UPDATE ON public.professional_account_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
