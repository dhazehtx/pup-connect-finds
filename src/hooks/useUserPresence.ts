
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface OnlineUser {
  user_id: string;
  username: string;
  avatar_url: string;
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

  const getUserPresence = useCallback((userId: string) => {
    return onlineUsers.find(u => u.user_id === userId);
  }, [onlineUsers]);

  const onlineCount = onlineUsers.length;

  useEffect(() => {
    if (!user) return;

    updatePresence('online');

    const fetchOnlineUsers = async () => {
      try {
        const { data } = await supabase
          .from('user_presence')
          .select(`
            user_id,
            status,
            last_seen_at,
            profiles:user_id (
              username,
              avatar_url
            )
          `)
          .eq('status', 'online');
        
        if (data) {
          const formattedUsers = data.map((item: any) => ({
            user_id: item.user_id,
            username: item.profiles?.username || 'Anonymous',
            avatar_url: item.profiles?.avatar_url || '',
            status: item.status as 'online' | 'offline' | 'away',
            last_seen_at: item.last_seen_at
          }));
          setOnlineUsers(formattedUsers);
        }
      } catch (error) {
        console.error('Error fetching online users:', error);
      }
    };

    fetchOnlineUsers();

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

    const interval = setInterval(() => {
      updatePresence('online');
    }, 30000);

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
    onlineCount,
    isUserOnline,
    getUserPresence,
    updatePresence
  };
};
