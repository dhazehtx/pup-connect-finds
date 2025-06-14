
-- Add foreign key constraint between posts and profiles tables
ALTER TABLE public.posts 
ADD CONSTRAINT posts_user_id_profiles_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
