
-- Add message reactions table
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add message threads table for reply chains
CREATE TABLE IF NOT EXISTS public.message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  reply_message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add user presence table for online/offline status
CREATE TABLE IF NOT EXISTS public.user_presence (
  user_id UUID PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away')),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add message templates table
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_reactions
CREATE POLICY "Users can view all message reactions" ON public.message_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own reactions" ON public.message_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON public.message_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for message_threads
CREATE POLICY "Users can view message threads" ON public.message_threads
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create threads" ON public.message_threads
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS policies for user_presence
CREATE POLICY "Users can view all presence status" ON public.user_presence
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own presence" ON public.user_presence
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for message_templates
CREATE POLICY "Users can view public templates and their own" ON public.message_templates
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own templates" ON public.message_templates
  FOR ALL USING (auth.uid() = user_id);

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('message-attachments', 'message-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for message attachments
CREATE POLICY "Anyone can view message attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'message-attachments');

CREATE POLICY "Authenticated users can upload message attachments" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'message-attachments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own message attachments" ON storage.objects
  FOR UPDATE USING (bucket_id = 'message-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own message attachments" ON storage.objects
  FOR DELETE USING (bucket_id = 'message-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to update user presence
CREATE OR REPLACE FUNCTION update_user_presence()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_presence (user_id, status, last_seen_at, updated_at)
  VALUES (NEW.user_id, 'online', now(), now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    status = 'online',
    last_seen_at = now(),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for new tables
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;
ALTER TABLE public.message_threads REPLICA IDENTITY FULL;
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;
ALTER TABLE public.message_templates REPLICA IDENTITY FULL;
