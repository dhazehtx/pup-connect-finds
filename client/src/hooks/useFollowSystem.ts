
import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower_profile?: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  following_profile?: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export const useFollowSystem = (userId?: string) => {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Follower[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFollowers = async () => {
    if (!userId) return;
    
    try {
      const data = await apiRequest(`/api/follows/followers/${userId}`);
      const mapped = (data?.followers || []).map((f: any) => ({
        id: f.id,
        follower_id: f.id,
        following_id: userId,
        created_at: f.followed_at,
        follower_profile: {
          id: f.id,
          full_name: f.full_name,
          username: f.username,
          avatar_url: f.avatar_url,
        },
      }));
      setFollowers(mapped);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchFollowing = async () => {
    if (!userId) return;
    
    try {
      const data = await apiRequest(`/api/follows/following/${userId}`);
      const mapped = (data?.following || []).map((f: any) => ({
        id: f.id,
        follower_id: userId,
        following_id: f.id,
        created_at: f.followed_at,
        following_profile: {
          id: f.id,
          full_name: f.full_name,
          username: f.username,
          avatar_url: f.avatar_url,
        },
      }));
      setFollowing(mapped);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const checkIfFollowing = async () => {
    if (!user || !userId || user.id === userId) return;

    try {
      const data = await apiRequest(`/api/follows/check/${userId}`);
      setIsFollowing(data?.isFollowing || false);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const followUser = async (targetUserId: string) => {
    if (!user) {
      toast({ title: "Login required", description: "Please sign in to follow users", variant: "destructive" });
      return;
    }

    try {
      const result = await apiRequest('/api/follows', {
        method: 'POST',
        body: { followed_id: targetUserId },
      });
      console.log('[PROOF:FOLLOW] response', JSON.stringify(result));

      setIsFollowing(result?.isFollowing ?? true);
      await fetchFollowers();
      
      toast({
        title: "Now following!",
        description: "You'll see their posts in your feed",
      });
    } catch (error: any) {
      console.error('[PROOF:FOLLOW] error', error);
      const msg = error?.message || "Failed to follow user";
      toast({
        title: "Couldn't follow",
        description: msg.includes('404') ? "That user's profile wasn't found" : msg.includes('400') ? "Invalid request" : msg,
        variant: "destructive",
      });
    }
  };

  const unfollowUser = async (targetUserId: string) => {
    if (!user) return;

    try {
      const result = await apiRequest(`/api/follows/${targetUserId}`, {
        method: 'DELETE',
      });
      console.log('[PROOF:UNFOLLOW] response', JSON.stringify(result));

      setIsFollowing(result?.isFollowing ?? false);
      await fetchFollowers();
      
      toast({
        title: "Unfollowed",
        description: "You won't see their posts in your feed anymore",
      });
    } catch (error: any) {
      console.error('[PROOF:UNFOLLOW] error', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to unfollow user",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (userId) {
      Promise.all([
        fetchFollowers(),
        fetchFollowing(),
        checkIfFollowing()
      ]).finally(() => setLoading(false));
    }
  }, [userId, user]);

  return {
    followers,
    following,
    isFollowing,
    loading,
    followUser,
    unfollowUser
  };
};
