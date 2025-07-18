
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useRealtimePostLikes = (postId: string) => {
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLikesCount = async () => {
    try {
      const { count, error } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) throw error;
      setLikesCount(count || 0);
    } catch (error) {
      console.error('Error fetching likes count:', error);
    }
  };

  const checkUserLiked = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking like status:', error);
        return;
      }

      setIsLiked(!!data);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to like posts",
        variant: "destructive",
      });
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      
      if (isLiked) {
        // Unlike the post
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Like the post
        const { error } = await supabase
          .from('post_likes')
          .insert([
            {
              post_id: postId,
              user_id: user.id
            }
          ]);

        if (error) {
          if (error.code === '23505') {
            // Already liked, just update state
            setIsLiked(true);
            return;
          }
          throw error;
        }

        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLikedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select(`
          id,
          user_id,
          created_at,
          profiles!post_likes_user_id_fkey (
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching liked users:', error);
      return [];
    }
  };

  useEffect(() => {
    if (postId) {
      fetchLikesCount();
      checkUserLiked();
    }
  }, [postId, user]);

  // Set up real-time subscription for likes
  useEffect(() => {
    if (!postId) return;

    const channel = supabase
      .channel(`post-likes-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_likes',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          console.log('New like added:', payload);
          setLikesCount(prev => prev + 1);
          if (payload.new.user_id === user?.id) {
            setIsLiked(true);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'post_likes',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          console.log('Like removed:', payload);
          setLikesCount(prev => prev - 1);
          if (payload.old.user_id === user?.id) {
            setIsLiked(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, user]);

  return {
    likesCount,
    isLiked,
    loading,
    toggleLike,
    getLikedUsers
  };
};
