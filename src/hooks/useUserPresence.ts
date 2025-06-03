import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPresence {
  user_id: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  last_seen: string;
  current_page?: string;
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
        await supabase.rpc('update_user_presence', {
          status,
          current_page: currentPage
        });
        setUserStatus(status);
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

    // Subscribe to presence changes
    const channel = supabase
      .channel('user-presence')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        (payload) => {
          console.log('Presence change:', payload);
          // Update online users list
          fetchOnlineUsers();
        }
      )
      .subscribe();

    // Fetch current online users
    const fetchOnlineUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('user_presence')
          .select('*')
          .eq('status', 'online')
          .gt('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Active in last 5 minutes

        if (error) throw error;
        setOnlineUsers(data || []);
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

  return {
    onlineUsers,
    userStatus,
    updateStatus: (status: 'online' | 'away' | 'busy' | 'offline') => {
      if (user) {
        supabase.rpc('update_user_presence', { status, current_page: currentPage });
        setUserStatus(status);
      }
    }
  };
};
