
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

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking follow status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
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
      const { error } = await supabase
        .from('follows')
        .insert([
          {
            follower_id: user.id,
            following_id: targetUserId
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          // Already following
          toast({
            title: "Info",
            description: "You are already following this user",
          });
          return true;
        }
        throw error;
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
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

      if (error) throw error;

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
      const { data, error } = await supabase
        .from('follows')
        .select(`
          id,
          follower_id,
          following_id,
          created_at,
          follower_profile:profiles!follows_follower_id_fkey (
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('following_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const followersWithProfile = (data || []).map(follow => ({
        ...follow,
        following_profile: follow.follower_profile
      }));

      setFollowers(followersWithProfile);
    } catch (error) {
      console.error('Error fetching followers:', error);
      toast({
        title: "Error",
        description: "Failed to load followers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFollowing = async (targetUserId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('follows')
        .select(`
          id,
          follower_id,
          following_id,
          created_at,
          following_profile:profiles!follows_following_id_fkey (
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('follower_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFollowing(data || []);
    } catch (error) {
      console.error('Error fetching following:', error);
      toast({
        title: "Error",
        description: "Failed to load following",
        variant: "destructive",
      });
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
