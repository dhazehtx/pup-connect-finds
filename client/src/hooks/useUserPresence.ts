
import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';

interface UserPresence {
  user_id: string;
  status: 'online' | 'offline' | 'away';
  last_seen_at: string;
}

export const useUserPresence = () => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [userPresence, setUserPresence] = useState<Record<string, UserPresence>>({});
  const { user } = useAuth();
  const { onEvent, connected } = useSocket();

  useEffect(() => {
    if (!user || !connected) return;

    const cleanupOnline = onEvent('presence:online', (data: { userId: string }) => {
      setOnlineUsers(prev => {
        if (prev.includes(data.userId)) return prev;
        return [...prev, data.userId];
      });
    });

    const cleanupOffline = onEvent('presence:offline', (data: { userId: string }) => {
      setOnlineUsers(prev => prev.filter(id => id !== data.userId));
    });

    return () => {
      cleanupOnline();
      cleanupOffline();
    };
  }, [user, connected, onEvent]);

  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.includes(userId);
  };

  const getUserPresence = (userId: string): UserPresence | null => {
    return userPresence[userId] || null;
  };

  const setUserOnline = async (userId: string) => {};

  const setUserOffline = async (userId: string) => {};

  return {
    onlineUsers,
    userPresence,
    isUserOnline,
    getUserPresence,
    setUserOnline,
    setUserOffline
  };
};
