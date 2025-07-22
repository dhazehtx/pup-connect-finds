
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase
        .from('follows')
        .select(`
          *,
          follower_profile:profiles!follows_follower_id_fkey (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('following_id', userId);

      if (error) throw error;
      setFollowers(data || []);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchFollowing = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          *,
          following_profile:profiles!follows_following_id_fkey (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('follower_id', userId);

      if (error) throw error;
      setFollowing(data || []);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const checkIfFollowing = async () => {
    if (!user || !userId || user.id === userId) return;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const followUser = async (targetUserId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: targetUserId
        });

      if (error) throw error;

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
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

      if (error) throw error;

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
