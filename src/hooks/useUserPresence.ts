
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserPresence {
  user_id: string;
  status: 'online' | 'offline' | 'away';
  last_seen_at: string;
}

export const useUserPresence = () => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [userPresence, setUserPresence] = useState<Record<string, UserPresence>>({});

  useEffect(() => {
    // Subscribe to presence updates
    const channel = supabase.channel('user-presence');
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users = Object.keys(presenceState);
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        setOnlineUsers(prev => [...prev, key]);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        setOnlineUsers(prev => prev.filter(userId => userId !== key));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.includes(userId);
  };

  const getUserPresence = (userId: string): UserPresence | null => {
    return userPresence[userId] || null;
  };

  const setUserOnline = async (userId: string) => {
    const channel = supabase.channel('user-presence');
    await channel.track({
      user_id: userId,
      status: 'online',
      last_seen_at: new Date().toISOString()
    });
  };

  const setUserOffline = async (userId: string) => {
    const channel = supabase.channel('user-presence');
    await channel.untrack();
  };

  return {
    onlineUsers,
    userPresence,
    isUserOnline,
    getUserPresence,
    setUserOnline,
    setUserOffline
  };
};
