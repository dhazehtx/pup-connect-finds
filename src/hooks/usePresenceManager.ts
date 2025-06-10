
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PresenceUser {
  user_id: string;
  username?: string;
  avatar_url?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  last_seen: string;
}

interface TypingUser {
  user_id: string;
  username?: string;
  conversation_id: string;
}

export const usePresenceManager = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  const updatePresence = useCallback(async (status: 'online' | 'away' | 'busy' | 'offline') => {
    if (!user) return;

    const channel = supabase.channel('presence-channel');
    
    await channel.track({
      user_id: user.id,
      username: user.email?.split('@')[0] || 'User',
      status,
      last_seen: new Date().toISOString(),
    });
  }, [user]);

  const setTyping = useCallback(async (conversationId: string, isTyping: boolean) => {
    if (!user) return;

    const channel = supabase.channel(`typing-${conversationId}`);
    
    if (isTyping) {
      await channel.track({
        user_id: user.id,
        username: user.email?.split('@')[0] || 'User',
        conversation_id: conversationId,
      });
    } else {
      await channel.untrack();
    }
  }, [user]);

  const getTypingUsers = useCallback((conversationId: string) => {
    return typingUsers.filter(u => u.conversation_id === conversationId && u.user_id !== user?.id);
  }, [typingUsers, user]);

  useEffect(() => {
    if (!user) return;

    // Set up presence tracking
    const presenceChannel = supabase
      .channel('presence-channel')
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users = Object.values(state).flat() as PresenceUser[];
        setOnlineUsers(users);
        setOnlineCount(users.filter(u => u.status === 'online').length);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await updatePresence('online');
        }
      });

    // Set user offline when they leave
    const handleBeforeUnload = () => {
      updatePresence('offline');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      presenceChannel.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, updatePresence]);

  // Update presence periodically
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      updatePresence('online');
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [user, updatePresence]);

  return {
    onlineUsers,
    onlineCount,
    typingUsers,
    updatePresence,
    setTyping,
    getTypingUsers,
  };
};
