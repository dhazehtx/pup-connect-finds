import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPresence {
  user_id: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  last_seen: string;
  current_page?: string;
  username?: string;
  avatar_url?: string;
}

export const useUserPresence = (currentPage?: string) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [userStatus, setUserStatus] = useState<'online' | 'away' | 'busy' | 'offline'>('offline');

  useEffect(() => {
    if (!user) return;

    // Update user presence when they come online
    const updatePresence = async (status: 'online' | 'away' | 'busy' | 'offline') => {
      try {
        // Since user_presence table doesn't exist in types, we'll use profiles for now
        const { error } = await supabase
          .from('profiles')
          .update({
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) throw error;
        setUserStatus(status);
        console.log('User presence updated:', status);
      } catch (error) {
        console.error('Failed to update presence:', error);
      }
    };

    // Set user as online when hook initializes
    updatePresence('online');

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence('away');
      } else {
        updatePresence('online');
      }
    };

    // Handle page unload
    const handleBeforeUnload = () => {
      navigator.sendBeacon('/api/presence', JSON.stringify({
        user_id: user.id,
        status: 'offline'
      }));
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Subscribe to profile changes for presence simulation
    const channel = supabase
      .channel('user-presence')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile change:', payload);
          // Update online users list
          fetchOnlineUsers();
        }
      )
      .subscribe();

    // Fetch current online users (simulate with recent profile updates)
    const fetchOnlineUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, updated_at')
          .gt('updated_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Active in last 5 minutes
          .limit(20);

        if (error) throw error;
        
        const formattedUsers: UserPresence[] = data?.map(profile => ({
          user_id: profile.id,
          status: 'online' as const,
          last_seen: profile.updated_at || new Date().toISOString(),
          username: profile.username || undefined,
          avatar_url: profile.avatar_url || undefined
        })) || [];
        
        setOnlineUsers(formattedUsers);
      } catch (error) {
        console.error('Failed to fetch online users:', error);
      }
    };

    fetchOnlineUsers();

    // Heartbeat to keep presence updated
    const heartbeat = setInterval(() => {
      if (!document.hidden) {
        updatePresence('online');
      }
    }, 30000); // Update every 30 seconds

    return () => {
      updatePresence('offline');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(heartbeat);
      supabase.removeChannel(channel);
    };
  }, [user, currentPage]);

  const getUserPresence = (userId: string) => {
    return onlineUsers.find(user => user.user_id === userId);
  };

  const isUserOnline = (userId: string) => {
    return onlineUsers.some(user => user.user_id === userId && user.status === 'online');
  };

  const updateStatus = async (status: 'online' | 'away' | 'busy' | 'offline') => {
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        setUserStatus(status);
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    }
  };

  return {
    onlineUsers,
    userStatus,
    onlineCount: onlineUsers.length,
    getUserPresence,
    isUserOnline,
    updateStatus
  };
};
