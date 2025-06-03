
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProfessionalConnection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  connection_type: 'professional' | 'mentorship' | 'collaboration';
  message?: string;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string;
    username: string;
    avatar_url?: string;
    user_type: string;
    verified: boolean;
  };
}

interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  followed_at: string;
  profile?: {
    full_name: string;
    username: string;
    avatar_url?: string;
    user_type: string;
    verified: boolean;
  };
}

export const useProfessionalNetwork = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState<ProfessionalConnection[]>([]);
  const [followers, setFollowers] = useState<UserFollow[]>([]);
  const [following, setFollowing] = useState<UserFollow[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ProfessionalConnection[]>([]);

  // Send connection request
  const sendConnectionRequest = useCallback(async (
    recipientId: string,
    connectionType: 'professional' | 'mentorship' | 'collaboration' = 'professional',
    message?: string
  ) => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('professional_connections')
        .insert({
          requester_id: user.id,
          recipient_id: recipientId,
          connection_type: connectionType,
          message,
          status: 'pending'
        })
        .select(`
          *,
          profile:profiles!professional_connections_recipient_id_fkey(
            full_name,
            username,
            avatar_url,
            user_type,
            verified
          )
        `)
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Connection request sent successfully",
      });

      return data;
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Respond to connection request
  const respondToConnectionRequest = useCallback(async (
    connectionId: string,
    response: 'accepted' | 'declined'
  ) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('professional_connections')
        .update({
          status: response,
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setPendingRequests(prev => prev.filter(req => req.id !== connectionId));
      
      if (response === 'accepted') {
        setConnections(prev => [data, ...prev]);
      }

      toast({
        title: "Success",
        description: `Connection request ${response}`,
      });

      return data;
    } catch (error) {
      console.error('Error responding to connection request:', error);
      toast({
        title: "Error",
        description: "Failed to respond to connection request",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Follow user
  const followUser = useCallback(async (userId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        })
        .select(`
          *,
          profile:profiles!user_follows_following_id_fkey(
            full_name,
            username,
            avatar_url,
            user_type,
            verified
          )
        `)
        .single();

      if (error) throw error;

      setFollowing(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Successfully followed user",
      });

      return data;
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, toast]);

  // Unfollow user
  const unfollowUser = useCallback(async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;

      setFollowing(prev => prev.filter(f => f.following_id !== userId));
      toast({
        title: "Success",
        description: "Successfully unfollowed user",
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, toast]);

  // Fetch connections
  const fetchConnections = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('professional_connections')
        .select(`
          *,
          profile:profiles!professional_connections_recipient_id_fkey(
            full_name,
            username,
            avatar_url,
            user_type,
            verified
          )
        `)
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  }, [user]);

  // Fetch pending requests
  const fetchPendingRequests = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('professional_connections')
        .select(`
          *,
          profile:profiles!professional_connections_requester_id_fkey(
            full_name,
            username,
            avatar_url,
            user_type,
            verified
          )
        `)
        .eq('recipient_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingRequests(data || []);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  }, [user]);

  // Fetch followers
  const fetchFollowers = useCallback(async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          *,
          profile:profiles!user_follows_follower_id_fkey(
            full_name,
            username,
            avatar_url,
            user_type,
            verified
          )
        `)
        .eq('following_id', targetUserId)
        .order('followed_at', { ascending: false });

      if (error) throw error;
      setFollowers(data || []);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  }, [user]);

  // Fetch following
  const fetchFollowing = useCallback(async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          *,
          profile:profiles!user_follows_following_id_fkey(
            full_name,
            username,
            avatar_url,
            user_type,
            verified
          )
        `)
        .eq('follower_id', targetUserId)
        .order('followed_at', { ascending: false });

      if (error) throw error;
      setFollowing(data || []);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  }, [user]);

  // Initialize data
  useEffect(() => {
    if (user) {
      fetchConnections();
      fetchPendingRequests();
      fetchFollowers();
      fetchFollowing();
    }
  }, [user, fetchConnections, fetchPendingRequests, fetchFollowers, fetchFollowing]);

  return {
    connections,
    followers,
    following,
    pendingRequests,
    loading,
    sendConnectionRequest,
    respondToConnectionRequest,
    followUser,
    unfollowUser,
    fetchConnections,
    fetchPendingRequests,
    fetchFollowers,
    fetchFollowing
  };
};
