
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  user_id: string;
  listing_id: string | null;
  caption: string | null;
  image_url: string | null;
  video_url: string | null;
  post_type: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

export const usePosts = (userId?: string, listingId?: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_profiles_id_fkey (
            full_name,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      if (listingId) {
        query = query.eq('listing_id', listingId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      const errorObj = error as Error;
      setError(errorObj);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== postId));
      toast({
        title: "Post Deleted",
        description: "Your post has been removed",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [userId, listingId]);

  return {
    posts,
    loading,
    error,
    fetchPosts,
    deletePost
  };
};
