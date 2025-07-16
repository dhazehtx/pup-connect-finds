
-- Create table for two-factor authentication
CREATE TABLE public.two_factor_auth (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  secret TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  backup_codes TEXT[], -- Array of backup codes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create table for email-based 2FA codes
CREATE TABLE public.email_2fa_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for login alerts and device tracking
CREATE TABLE public.login_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_info JSONB,
  ip_address INET,
  location TEXT,
  user_agent TEXT,
  is_new_device BOOLEAN NOT NULL DEFAULT false,
  login_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for password reset tokens
CREATE TABLE public.password_reset_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_2fa_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies for two_factor_auth
CREATE POLICY "Users can manage their own 2FA settings"
  ON public.two_factor_auth
  FOR ALL
  USING (auth.uid() = user_id);

-- RLS policies for email_2fa_codes
CREATE POLICY "Users can manage their own 2FA codes"
  ON public.email_2fa_codes
  FOR ALL
  USING (auth.uid() = user_id);

-- RLS policies for login_sessions
CREATE POLICY "Users can view their own login sessions"
  ON public.login_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert login sessions"
  ON public.login_sessions
  FOR INSERT
  WITH CHECK (true);

-- RLS policies for password_reset_tokens
CREATE POLICY "Users can view their own reset tokens"
  ON public.password_reset_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage reset tokens"
  ON public.password_reset_tokens
  FOR ALL
  WITH CHECK (true);

-- Create function to clean up expired codes and tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_auth_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete expired 2FA codes
  DELETE FROM public.email_2fa_codes 
  WHERE expires_at < now();
  
  -- Delete expired reset tokens
  DELETE FROM public.password_reset_tokens 
  WHERE expires_at < now() OR used = true;
  
  -- Delete old login sessions (keep last 30 days)
  DELETE FROM public.login_sessions 
  WHERE login_time < now() - INTERVAL '30 days';
END;
$$;

-- Create function to generate 2FA code
CREATE OR REPLACE FUNCTION public.generate_2fa_code(user_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code TEXT;
BEGIN
  -- Generate 6-digit code
  code := LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
  
  -- Delete any existing codes for this user
  DELETE FROM public.email_2fa_codes WHERE user_id = user_id_param;
  
  -- Insert new code (expires in 10 minutes)
  INSERT INTO public.email_2fa_codes (user_id, code, expires_at)
  VALUES (user_id_param, code, now() + INTERVAL '10 minutes');
  
  RETURN code;
END;
$$;

-- Create function to verify 2FA code
CREATE OR REPLACE FUNCTION public.verify_2fa_code(user_id_param UUID, code_param TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_valid BOOLEAN := false;
BEGIN
  -- Check if code exists and is not expired
  UPDATE public.email_2fa_codes 
  SET verified = true
  WHERE user_id = user_id_param 
    AND code = code_param 
    AND expires_at > now() 
    AND verified = false
  RETURNING true INTO is_valid;
  
  RETURN COALESCE(is_valid, false);
END;
$$;
