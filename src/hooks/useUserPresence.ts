
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface OnlineUser {
  user_id: string;
  status: 'online' | 'offline' | 'away';
  last_seen_at: string;
}

export const useUserPresence = () => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const { user } = useAuth();

  const updatePresence = useCallback(async (status: 'online' | 'offline' | 'away') => {
    if (!user) return;

    try {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          status,
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, [user]);

  const isUserOnline = useCallback((userId: string) => {
    const userPresence = onlineUsers.find(u => u.user_id === userId);
    return userPresence?.status === 'online';
  }, [onlineUsers]);

  useEffect(() => {
    if (!user) return;

    // Set user as online when component mounts
    updatePresence('online');

    // Fetch current online users
    const fetchOnlineUsers = async () => {
      try {
        const { data } = await supabase
          .from('user_presence')
          .select('*')
          .eq('status', 'online');
        
        if (data) {
          setOnlineUsers(data);
        }
      } catch (error) {
        console.error('Error fetching online users:', error);
      }
    };

    fetchOnlineUsers();

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
        () => {
          fetchOnlineUsers();
        }
      )
      .subscribe();

    // Update presence periodically
    const interval = setInterval(() => {
      updatePresence('online');
    }, 30000); // Every 30 seconds

    // Set user as offline when leaving
    const handleBeforeUnload = () => {
      updatePresence('offline');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      updatePresence('offline');
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      supabase.removeChannel(channel);
    };
  }, [user, updatePresence]);

  return {
    onlineUsers,
    isUserOnline,
    updatePresence
  };
};
