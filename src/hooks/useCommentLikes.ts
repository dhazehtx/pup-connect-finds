
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface CommentLike {
  id: string;
  comment_id: string;
  user_id: string;
  created_at: string;
}

export const useCommentLikes = (commentId: string) => {
  const [likes, setLikes] = useState<CommentLike[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('comment_likes')
        .select('*')
        .eq('comment_id', commentId);

      if (error) throw error;
      
      setLikes(data || []);
      setIsLiked(data?.some(like => like.user_id === user?.id) || false);
    } catch (error) {
      console.error('Error fetching comment likes:', error);
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to like comments",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        if (error) throw error;
        
        setLikes(prev => prev.filter(like => like.user_id !== user.id));
        setIsLiked(false);
      } else {
        // Like
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });

        if (error) throw error;
        
        const newLike: CommentLike = {
          id: 'temp-id',
          comment_id: commentId,
          user_id: user.id,
          created_at: new Date().toISOString()
        };
        
        setLikes(prev => [...prev, newLike]);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling comment like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (commentId) {
      fetchLikes();
    }
  }, [commentId, user]);

  return {
    likes,
    isLiked,
    loading,
    toggleLike,
    likesCount: likes.length
  };
};
