
import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const usePostLikes = (postId: string) => {
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLikes = useCallback(async () => {
    if (!postId) return;
    try {
      const data = await apiRequest(`/api/posts/${postId}/likes`);
      setLikesCount(data.count ?? 0);
      setIsLiked(data.likedByUser ?? false);
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  }, [postId]);

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

    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      setLoading(true);
      const data = await apiRequest(`/api/posts/${postId}/likes/toggle`, {
        method: 'POST',
      });
      setLikesCount(data.likeCount ?? (prevLiked ? prevCount - 1 : prevCount + 1));
      setIsLiked(data.isLiked ?? !prevLiked);
    } catch (error: any) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
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
    return [];
  };

  useEffect(() => {
    fetchLikes();
  }, [fetchLikes, user]);

  useEffect(() => {
    if (!postId) return;
    const interval = setInterval(fetchLikes, 15000);
    return () => clearInterval(interval);
  }, [postId, fetchLikes]);

  return {
    likesCount,
    isLiked,
    loading,
    toggleLike,
    getLikedUsers
  };
};
