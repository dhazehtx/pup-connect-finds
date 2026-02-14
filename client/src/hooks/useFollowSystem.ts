
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
    if (!user) return;

    try {
      await apiRequest('/api/follows', {
        method: 'POST',
        body: { followed_id: targetUserId },
      });

      setIsFollowing(true);
      await fetchFollowers();
      
      toast({
        title: "Success",
        description: "User followed successfully",
      });
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
    }
  };

  const unfollowUser = async (targetUserId: string) => {
    if (!user) return;

    try {
      await apiRequest(`/api/follows/${targetUserId}`, {
        method: 'DELETE',
      });

      setIsFollowing(false);
      await fetchFollowers();
      
      toast({
        title: "Success",
        description: "User unfollowed successfully",
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast({
        title: "Error",
        description: "Failed to unfollow user",
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
