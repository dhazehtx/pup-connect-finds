
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  following_profile?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export const useFollowSystem = (userId?: string) => {
  const [followers, setFollowers] = useState<UserFollow[]>([]);
  const [following, setFollowing] = useState<UserFollow[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const checkFollowStatus = async (targetUserId: string) => {
    if (!user) return false;

    // For now, use local storage to simulate follows
    const follows = JSON.parse(localStorage.getItem(`user_follows_${user.id}`) || '[]');
    return follows.includes(targetUserId);
  };

  const followUser = async (targetUserId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to follow users",
        variant: "destructive",
      });
      return false;
    }

    try {
      // For now, use local storage to simulate follows
      const follows = JSON.parse(localStorage.getItem(`user_follows_${user.id}`) || '[]');
      if (!follows.includes(targetUserId)) {
        follows.push(targetUserId);
        localStorage.setItem(`user_follows_${user.id}`, JSON.stringify(follows));
      }

      setIsFollowing(true);
      toast({
        title: "Success",
        description: "You are now following this user",
      });

      return true;
    } catch (error: any) {
      console.error('Error following user:', error);
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
      return false;
    }
  };

  const unfollowUser = async (targetUserId: string) => {
    if (!user) return false;

    try {
      // For now, use local storage to simulate follows
      const follows = JSON.parse(localStorage.getItem(`user_follows_${user.id}`) || '[]');
      const updatedFollows = follows.filter((id: string) => id !== targetUserId);
      localStorage.setItem(`user_follows_${user.id}`, JSON.stringify(updatedFollows));

      setIsFollowing(false);
      toast({
        title: "Success",
        description: "You have unfollowed this user",
      });

      return true;
    } catch (error: any) {
      console.error('Error unfollowing user:', error);
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive",
      });
      return false;
    }
  };

  const getFollowers = async (targetUserId: string) => {
    try {
      setLoading(true);
      // For now, return empty array since we're simulating
      setFollowers([]);
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFollowing = async (targetUserId: string) => {
    try {
      setLoading(true);
      // For now, return empty array since we're simulating
      setFollowing([]);
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && user) {
      checkFollowStatus(userId).then(setIsFollowing);
      getFollowers(userId);
      getFollowing(userId);
    }
  }, [userId, user]);

  return {
    followers,
    following,
    isFollowing,
    loading,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing
  };
};
