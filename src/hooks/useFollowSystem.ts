
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export const useFollowSystem = (userId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Follower[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFollowData = async () => {
    if (!userId) return;

    try {
      // Get followers
      const { data: followersData, error: followersError } = await supabase
        .from('follows')
        .select('*')
        .eq('following_id', userId);

      if (followersError) throw followersError;

      // Get following
      const { data: followingData, error: followingError } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', userId);

      if (followingError) throw followingError;

      setFollowers(followersData || []);
      setFollowing(followingData || []);

      // Check if current user is following this user
      if (user?.id && userId !== user.id) {
        const isUserFollowing = followersData?.some(
          (follow) => follow.follower_id === user.id
        );
        setIsFollowing(!!isUserFollowing);
      }
    } catch (error) {
      console.error('Error fetching follow data:', error);
      toast({
        title: "Error",
        description: "Failed to load follow data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (targetUserId: string) => {
    if (!user?.id || user.id === targetUserId) return;

    try {
      const { error } = await supabase
        .from('follows')
        .insert([
          {
            follower_id: user.id,
            following_id: targetUserId,
          },
        ]);

      if (error) throw error;

      setIsFollowing(true);
      setFollowers(prev => [...prev, {
        id: '',
        follower_id: user.id,
        following_id: targetUserId,
        created_at: new Date().toISOString(),
      }]);

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
    if (!user?.id || user.id === targetUserId) return;

    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

      if (error) throw error;

      setIsFollowing(false);
      setFollowers(prev => prev.filter(
        follow => follow.follower_id !== user.id
      ));

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
    fetchFollowData();
  }, [userId, user?.id]);

  return {
    followers,
    following,
    isFollowing,
    loading,
    followUser,
    unfollowUser,
    refetch: fetchFollowData,
  };
};
