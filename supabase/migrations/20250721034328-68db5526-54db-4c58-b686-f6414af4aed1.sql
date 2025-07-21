
-- Add a table for comment likes
CREATE TABLE public.comment_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id uuid NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS on comment_likes table
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for comment_likes
CREATE POLICY "Users can view all comment likes" 
  ON public.comment_likes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own comment likes" 
  ON public.comment_likes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment likes" 
  ON public.comment_likes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user_id ON public.comment_likes(user_id);
