
import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
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

export type UsePostsOptions = { listingId?: string; enabled?: boolean };

export const usePosts = (userId?: string, options: UsePostsOptions = {}) => {
  const { listingId, enabled = true } = options;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postCount, setPostCount] = useState(0);
  const { toast } = useToast();

  const fetchPosts = async () => {
    if (!enabled) {
      setPosts([]);
      setPostCount(0);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      let url = '/api/posts';
      const params: string[] = [];
      if (userId) params.push(`userId=${userId}`);
      if (listingId) params.push(`listingId=${listingId}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const data = await apiRequest(url);
      setPosts(data || []);
      setPostCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPostCount = async (targetUserId: string) => {
    try {
      const data = await apiRequest(`/api/posts?userId=${targetUserId}`);
      return data?.length || 0;
    } catch (error) {
      console.error('Error fetching post count:', error);
      return 0;
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await apiRequest(`/api/posts/${postId}`, { method: 'DELETE' });

      setPosts(posts.filter(post => post.id !== postId));
      setPostCount(prev => Math.max(0, prev - 1));
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
  }, [userId, listingId, enabled]);

  return {
    posts,
    loading,
    postCount,
    fetchPosts,
    fetchPostCount,
    deletePost
  };
};
