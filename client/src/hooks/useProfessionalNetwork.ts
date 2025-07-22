
import { useState, useEffect, useCallback } from 'react';
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

  // Mock data for demonstration
  const mockFollowers: UserFollow[] = [
    {
      id: '1',
      follower_id: 'user1',
      following_id: user?.id || 'current-user',
      followed_at: new Date().toISOString(),
      profile: {
        full_name: 'Sarah Johnson',
        username: 'sarah_j',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
        user_type: 'buyer',
        verified: true
      }
    },
    {
      id: '2',
      follower_id: 'user2',
      following_id: user?.id || 'current-user',
      followed_at: new Date().toISOString(),
      profile: {
        full_name: 'Mike Davis',
        username: 'mike_d',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        user_type: 'breeder',
        verified: false
      }
    }
  ];

  const mockFollowing: UserFollow[] = [
    {
      id: '3',
      follower_id: user?.id || 'current-user',
      following_id: 'user3',
      followed_at: new Date().toISOString(),
      profile: {
        full_name: 'Emma Wilson',
        username: 'emma_w',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        user_type: 'breeder',
        verified: true
      }
    }
  ];

  // Send connection request (mock implementation)
  const sendConnectionRequest = useCallback(async (
    recipientId: string,
    connectionType: 'professional' | 'mentorship' | 'collaboration' = 'professional',
    message?: string
  ) => {
    if (!user) return;

    try {
      setLoading(true);

      // Mock implementation
      const newConnection: ProfessionalConnection = {
        id: Math.random().toString(36).substr(2, 9),
        requester_id: user.id,
        recipient_id: recipientId,
        connection_type: connectionType,
        message,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      toast({
        title: "Success",
        description: "Connection request sent successfully",
      });

      return newConnection;
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

  // Respond to connection request (mock implementation)
  const respondToConnectionRequest = useCallback(async (
    connectionId: string,
    response: 'accepted' | 'declined'
  ) => {
    try {
      setLoading(true);

      // Mock implementation
      setPendingRequests(prev => prev.filter(req => req.id !== connectionId));

      toast({
        title: "Success",
        description: `Connection request ${response}`,
      });

      return { id: connectionId, status: response };
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

  // Follow user (mock implementation)
  const followUser = useCallback(async (userId: string) => {
    if (!user) return;

    try {
      const newFollow: UserFollow = {
        id: Math.random().toString(36).substr(2, 9),
        follower_id: user.id,
        following_id: userId,
        followed_at: new Date().toISOString()
      };

      setFollowing(prev => [newFollow, ...prev]);
      toast({
        title: "Success",
        description: "Successfully followed user",
      });

      return newFollow;
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

  // Unfollow user (mock implementation)
  const unfollowUser = useCallback(async (userId: string) => {
    if (!user) return;

    try {
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

  // Fetch connections (mock implementation)
  const fetchConnections = useCallback(async () => {
    if (!user) return;
    setConnections([]);
  }, [user]);

  // Fetch pending requests (mock implementation)
  const fetchPendingRequests = useCallback(async () => {
    if (!user) return;
    setPendingRequests([]);
  }, [user]);

  // Fetch followers (mock implementation)
  const fetchFollowers = useCallback(async (userId?: string) => {
    setFollowers(mockFollowers);
  }, []);

  // Fetch following (mock implementation)
  const fetchFollowing = useCallback(async (userId?: string) => {
    setFollowing(mockFollowing);
  }, []);

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
