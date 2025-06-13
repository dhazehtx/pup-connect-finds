
-- Create function for user data export (GDPR/CCPA compliance)
CREATE OR REPLACE FUNCTION public.export_user_data(user_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_data JSONB := '{}';
  profile_data JSONB;
  listings_data JSONB;
  messages_data JSONB;
  reviews_data JSONB;
  favorites_data JSONB;
  notifications_data JSONB;
BEGIN
  -- Check if requesting user is the same as the target user
  IF auth.uid() != user_id_param THEN
    RAISE EXCEPTION 'Unauthorized: Can only export your own data';
  END IF;

  -- Export profile data
  SELECT jsonb_build_object(
    'profile', to_jsonb(p)
  ) INTO profile_data
  FROM profiles p
  WHERE p.id = user_id_param;

  -- Export listings data
  SELECT jsonb_build_object(
    'listings', jsonb_agg(to_jsonb(dl))
  ) INTO listings_data
  FROM dog_listings dl
  WHERE dl.user_id = user_id_param;

  -- Export messages data (sanitized - only user's own messages)
  SELECT jsonb_build_object(
    'messages', jsonb_agg(
      jsonb_build_object(
        'id', m.id,
        'content', m.content,
        'created_at', m.created_at,
        'conversation_id', m.conversation_id,
        'message_type', m.message_type
      )
    )
  ) INTO messages_data
  FROM messages m
  WHERE m.sender_id = user_id_param;

  -- Export reviews data
  SELECT jsonb_build_object(
    'reviews_given', jsonb_agg(to_jsonb(r))
  ) INTO reviews_data
  FROM reviews r
  WHERE r.reviewer_id = user_id_param;

  -- Export favorites data
  SELECT jsonb_build_object(
    'favorites', jsonb_agg(to_jsonb(f))
  ) INTO favorites_data
  FROM favorites f
  WHERE f.user_id = user_id_param;

  -- Export notifications data
  SELECT jsonb_build_object(
    'notifications', jsonb_agg(to_jsonb(n))
  ) INTO notifications_data
  FROM notifications n
  WHERE n.user_id = user_id_param;

  -- Combine all data
  user_data := jsonb_build_object(
    'export_date', now(),
    'user_id', user_id_param,
    'profile', COALESCE(profile_data->'profile', '{}'::jsonb),
    'listings', COALESCE(listings_data->'listings', '[]'::jsonb),
    'messages', COALESCE(messages_data->'messages', '[]'::jsonb),
    'reviews_given', COALESCE(reviews_data->'reviews_given', '[]'::jsonb),
    'favorites', COALESCE(favorites_data->'favorites', '[]'::jsonb),
    'notifications', COALESCE(notifications_data->'notifications', '[]'::jsonb)
  );

  RETURN user_data;
END;
$$;

-- Create function for account deletion with data cleanup
CREATE OR REPLACE FUNCTION public.delete_user_account(user_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deletion_summary JSONB := '{}';
  listings_count INT;
  messages_count INT;
  reviews_count INT;
  favorites_count INT;
  notifications_count INT;
BEGIN
  -- Check if requesting user is the same as the target user
  IF auth.uid() != user_id_param THEN
    RAISE EXCEPTION 'Unauthorized: Can only delete your own account';
  END IF;

  -- Count data before deletion for summary
  SELECT COUNT(*) INTO listings_count FROM dog_listings WHERE user_id = user_id_param;
  SELECT COUNT(*) INTO messages_count FROM messages WHERE sender_id = user_id_param;
  SELECT COUNT(*) INTO reviews_count FROM reviews WHERE reviewer_id = user_id_param;
  SELECT COUNT(*) INTO favorites_count FROM favorites WHERE user_id = user_id_param;
  SELECT COUNT(*) INTO notifications_count FROM notifications WHERE user_id = user_id_param;

  -- Delete user data in proper order (respecting foreign key constraints)
  
  -- Delete user interactions and analytics
  DELETE FROM user_interactions WHERE user_id = user_id_param;
  DELETE FROM analytics_events WHERE user_id = user_id_param;
  
  -- Delete notifications
  DELETE FROM notifications WHERE user_id = user_id_param OR sender_id = user_id_param;
  
  -- Delete favorites
  DELETE FROM favorites WHERE user_id = user_id_param;
  
  -- Delete reviews (both given and received)
  DELETE FROM reviews WHERE reviewer_id = user_id_param OR reviewed_user_id = user_id_param;
  
  -- Delete messages
  DELETE FROM messages WHERE sender_id = user_id_param;
  
  -- Delete conversations where user is participant
  DELETE FROM conversations WHERE buyer_id = user_id_param OR seller_id = user_id_param;
  
  -- Delete payment related data
  DELETE FROM payment_methods WHERE user_id = user_id_param;
  DELETE FROM escrow_transactions WHERE buyer_id = user_id_param OR seller_id = user_id_param;
  
  -- Delete verification and background check data
  DELETE FROM verification_requests WHERE user_id = user_id_param;
  DELETE FROM verification_documents WHERE user_id = user_id_param;
  DELETE FROM background_checks WHERE user_id = user_id_param;
  
  -- Delete social accounts
  DELETE FROM social_accounts WHERE user_id = user_id_param;
  
  -- Delete user preferences and settings
  DELETE FROM user_preferences WHERE user_id = user_id_param;
  DELETE FROM matching_preferences WHERE user_id = user_id_param;
  DELETE FROM saved_searches WHERE user_id = user_id_param;
  
  -- Delete listings (this will cascade to related data)
  DELETE FROM dog_listings WHERE user_id = user_id_param;
  
  -- Delete profile
  DELETE FROM profiles WHERE id = user_id_param;
  
  -- Build deletion summary
  deletion_summary := jsonb_build_object(
    'deleted_at', now(),
    'user_id', user_id_param,
    'summary', jsonb_build_object(
      'listings_deleted', listings_count,
      'messages_deleted', messages_count,
      'reviews_deleted', reviews_count,
      'favorites_deleted', favorites_count,
      'notifications_deleted', notifications_count
    )
  );

  RETURN deletion_summary;
END;
$$;

-- Create account recovery table for temporary storage before final deletion
CREATE TABLE IF NOT EXISTS public.account_recovery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recovery_token TEXT NOT NULL UNIQUE,
  user_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 days'),
  recovered BOOLEAN DEFAULT false
);

-- Enable RLS on account recovery table
ALTER TABLE public.account_recovery ENABLE ROW LEVEL SECURITY;

-- Create policy for account recovery (only user can access their own recovery data)
CREATE POLICY "Users can access their own recovery data"
  ON public.account_recovery
  FOR ALL
  USING (auth.uid() = user_id);

-- Function to initiate account deletion (with recovery period)
CREATE OR REPLACE FUNCTION public.initiate_account_deletion()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id_param UUID := auth.uid();
  recovery_token TEXT;
  user_export JSONB;
  result JSONB;
BEGIN
  IF user_id_param IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Generate recovery token
  recovery_token := encode(gen_random_bytes(32), 'hex');
  
  -- Export user data for recovery
  SELECT public.export_user_data(user_id_param) INTO user_export;
  
  -- Store recovery data
  INSERT INTO public.account_recovery (user_id, recovery_token, user_data)
  VALUES (user_id_param, recovery_token, user_export);
  
  result := jsonb_build_object(
    'success', true,
    'recovery_token', recovery_token,
    'expires_at', (now() + INTERVAL '30 days'),
    'message', 'Account deletion initiated. You have 30 days to recover your account using the recovery token.'
  );
  
  RETURN result;
END;
$$;

-- Function to recover account
CREATE OR REPLACE FUNCTION public.recover_account(recovery_token_param TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recovery_record RECORD;
  result JSONB;
BEGIN
  -- Find recovery record
  SELECT * INTO recovery_record
  FROM public.account_recovery
  WHERE recovery_token = recovery_token_param
    AND expires_at > now()
    AND NOT recovered;
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired recovery token';
  END IF;
  
  -- Mark as recovered
  UPDATE public.account_recovery
  SET recovered = true
  WHERE recovery_token = recovery_token_param;
  
  result := jsonb_build_object(
    'success', true,
    'message', 'Account recovery successful. Your account deletion has been cancelled.',
    'user_data', recovery_record.user_data
  );
  
  RETURN result;
END;
$$;
