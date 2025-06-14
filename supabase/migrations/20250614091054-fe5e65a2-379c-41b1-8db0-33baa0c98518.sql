
-- Create posts table for user feed-style posts
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  listing_id UUID REFERENCES public.dog_listings NULL, -- Optional: link to specific listing
  caption TEXT,
  image_url TEXT,
  video_url TEXT,
  post_type TEXT NOT NULL DEFAULT 'profile', -- 'profile' or 'listing'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies for posts
CREATE POLICY "Users can view all posts" 
  ON public.posts 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own posts" 
  ON public.posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
  ON public.posts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
  ON public.posts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE TRIGGER update_posts_updated_at 
  BEFORE UPDATE ON public.posts 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();
