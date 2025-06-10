
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPresence {
  user_id: string;
  status: 'online' | 'away' | 'offline';
  last_seen: string;
  username?: string;
  avatar_url?: string;
}

interface TypingUser {
  user_id: string;
  username?: string;
  conversation_id: string;
}

export const usePresenceManager = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [myStatus, setMyStatus] = useState<'online' | 'away' | 'offline'>('offline');

  // Update user's presence status
  const updatePresence = useCallback(async (status: 'online' | 'away' | 'offline') => {
    if (!user) return;

    try {
      const presenceData = {
        user_id: user.id,
        status,
        last_seen: new Date().toISOString(),
        username: user.user_metadata?.username || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url
      };

      // Use Supabase Realtime presence
      const channel = supabase.channel('global-presence');
      await channel.track(presenceData);
      setMyStatus(status);
      
      console.log('Presence updated:', status);
    } catch (error) {
      console.error('Failed to update presence:', error);
    }
  }, [user]);

  // Set up presence tracking
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('global-presence')
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users: UserPresence[] = [];
        
        Object.keys(presenceState).forEach(key => {
          const presences = presenceState[key] as any[];
          presences.forEach(presence => {
            users.push({
              user_id: presence.user_id,
              status: presence.status,
              last_seen: presence.last_seen,
              username: presence.username,
              avatar_url: presence.avatar_url
            });
          });
        });
        
        setOnlineUsers(users.filter(u => u.user_id !== user.id));
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
      updatePresence('offline');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Heartbeat to maintain presence
    const heartbeat = setInterval(() => {
      if (!document.hidden) {
        updatePresence('online');
      }
    }, 30000);

    return () => {
      updatePresence('offline');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(heartbeat);
      supabase.removeChannel(channel);
    };
  }, [user, updatePresence]);

  // Typing indicators
  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
    if (!user) return;

    const typingChannel = supabase.channel(`typing-${conversationId}`);
    
    if (isTyping) {
      typingChannel.track({
        user_id: user.id,
        username: user.user_metadata?.username || user.email?.split('@')[0],
        conversation_id: conversationId,
        typing: true
      });
    } else {
      typingChannel.untrack();
    }
  }, [user]);

  // Listen to typing indicators for a conversation
  const subscribeToTyping = useCallback((conversationId: string) => {
    if (!user) return () => {};

    const typingChannel = supabase
      .channel(`typing-${conversationId}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = typingChannel.presenceState();
        const typing: TypingUser[] = [];
        
        Object.keys(presenceState).forEach(key => {
          const presences = presenceState[key] as any[];
          presences.forEach(presence => {
            if (presence.user_id !== user.id && presence.typing) {
              typing.push({
                user_id: presence.user_id,
                username: presence.username,
                conversation_id: presence.conversation_id
              });
            }
          });
        });
        
        setTypingUsers(prev => [
          ...prev.filter(t => t.conversation_id !== conversationId),
          ...typing
        ]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(typingChannel);
      setTypingUsers(prev => prev.filter(t => t.conversation_id !== conversationId));
    };
  }, [user]);

  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers.some(u => u.user_id === userId && u.status === 'online');
  }, [onlineUsers]);

  const getUserPresence = useCallback((userId: string) => {
    return onlineUsers.find(u => u.user_id === userId);
  }, [onlineUsers]);

  const getTypingUsers = useCallback((conversationId: string) => {
    return typingUsers.filter(t => t.conversation_id === conversationId);
  }, [typingUsers]);

  return {
    onlineUsers,
    typingUsers,
    myStatus,
    updatePresence,
    sendTypingIndicator,
    subscribeToTyping,
    isUserOnline,
    getUserPresence,
    getTypingUsers,
    onlineCount: onlineUsers.length
  };
};
