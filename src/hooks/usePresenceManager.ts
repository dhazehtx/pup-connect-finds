
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PresenceUser {
  user_id: string;
  username: string;
  avatar_url?: string;
  last_seen?: string;
  typing?: boolean;
}

export const usePresenceManager = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Record<string, PresenceUser[]>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, PresenceUser[]>>({});
  const channelsRef = useRef<Record<string, any>>({});

  console.log('👥 usePresenceManager - State:', {
    userId: user?.id,
    onlineChannels: Object.keys(onlineUsers),
    typingChannels: Object.keys(typingUsers)
  });

  const joinPresence = useCallback(async (conversationId: string) => {
    if (!user || channelsRef.current[conversationId]) return;

    console.log('🟢 usePresenceManager - Joining presence for conversation:', conversationId);

    const channel = supabase.channel(`presence-${conversationId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Track user presence
    await channel.track({
      user_id: user.id,
      username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
      avatar_url: user.user_metadata?.avatar_url,
      last_seen: new Date().toISOString(),
      typing: false
    });

    // Listen for presence changes
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const users: PresenceUser[] = [];
      
      Object.values(state).forEach((presences: any) => {
        presences.forEach((presence: any) => {
          if (presence.user_id !== user.id) {
            users.push(presence);
          }
        });
      });

      console.log('👥 usePresenceManager - Presence sync:', {
        conversationId,
        onlineUsers: users.length
      });

      setOnlineUsers(prev => ({ ...prev, [conversationId]: users }));
    });

    // Listen for typing indicators
    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('🟢 usePresenceManager - User joined:', key);
    });

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('🔴 usePresenceManager - User left:', key);
    });

    await channel.subscribe();
    channelsRef.current[conversationId] = channel;
  }, [user]);

  const leavePresence = useCallback(async (conversationId: string) => {
    const channel = channelsRef.current[conversationId];
    if (!channel) return;

    console.log('🔴 usePresenceManager - Leaving presence for conversation:', conversationId);

    await channel.untrack();
    await supabase.removeChannel(channel);
    delete channelsRef.current[conversationId];
    
    setOnlineUsers(prev => {
      const newState = { ...prev };
      delete newState[conversationId];
      return newState;
    });
    
    setTypingUsers(prev => {
      const newState = { ...prev };
      delete newState[conversationId];
      return newState;
    });
  }, []);

  const updateTypingStatus = useCallback(async (conversationId: string, isTyping: boolean) => {
    const channel = channelsRef.current[conversationId];
    if (!channel || !user) return;

    console.log('⌨️ usePresenceManager - Updating typing status:', {
      conversationId,
      isTyping,
      userId: user.id
    });

    await channel.track({
      user_id: user.id,
      username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
      avatar_url: user.user_metadata?.avatar_url,
      last_seen: new Date().toISOString(),
      typing: isTyping
    });

    // Update typing users state
    const state = channel.presenceState();
    const typing: PresenceUser[] = [];
    
    Object.values(state).forEach((presences: any) => {
      presences.forEach((presence: any) => {
        if (presence.user_id !== user.id && presence.typing) {
          typing.push(presence);
        }
      });
    });

    setTypingUsers(prev => ({ ...prev, [conversationId]: typing }));
  }, [user]);

  const getOnlineUsers = useCallback((conversationId: string): PresenceUser[] => {
    return onlineUsers[conversationId] || [];
  }, [onlineUsers]);

  const getTypingUsers = useCallback((conversationId: string): PresenceUser[] => {
    return typingUsers[conversationId] || [];
  }, [typingUsers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(channelsRef.current).forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, []);

  return {
    joinPresence,
    leavePresence,
    updateTypingStatus,
    getOnlineUsers,
    getTypingUsers,
    onlineUsers: onlineUsers,
    typingUsers: typingUsers
  };
};
