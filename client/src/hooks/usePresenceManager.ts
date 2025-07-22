
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TypingUser {
  user_id: string;
  username: string;
  avatar_url?: string;
  conversation_id: string;
  timestamp: number;
}

interface PresenceUser {
  user_id: string;
  username: string;
  avatar_url?: string;
  status: 'online' | 'offline' | 'away';
  last_seen: number;
}

export const usePresenceManager = () => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [channels, setChannels] = useState<Map<string, any>>(new Map());
  const { user } = useAuth();

  console.log('🎭 usePresenceManager - State:', {
    typingUsersCount: typingUsers.length,
    onlineUsersCount: onlineUsers.length,
    channelsCount: channels.size,
    currentUser: user?.id
  });

  // Set up presence for a conversation
  const setupConversationPresence = useCallback((conversationId: string) => {
    if (!user || channels.has(conversationId)) return;

    console.log('🎭 usePresenceManager - Setting up presence for conversation:', conversationId);

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        console.log('🎭 usePresenceManager - Presence sync:', presenceState);
        
        const currentTyping: TypingUser[] = [];
        const currentOnline: PresenceUser[] = [];
        
        Object.values(presenceState).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.user_id === user.id) return; // Don't include self
            
            // Handle typing status
            if (presence.typing && Date.now() - presence.typing_timestamp < 5000) {
              currentTyping.push({
                user_id: presence.user_id,
                username: presence.username || 'Unknown User',
                avatar_url: presence.avatar_url,
                conversation_id: conversationId,
                timestamp: presence.typing_timestamp
              });
            }
            
            // Handle online status
            currentOnline.push({
              user_id: presence.user_id,
              username: presence.username || 'Unknown User',
              avatar_url: presence.avatar_url,
              status: presence.status || 'online',
              last_seen: presence.last_seen || Date.now()
            });
          });
        });
        
        setTypingUsers(prev => {
          // Remove old typing users from other conversations and add new ones
          const filtered = prev.filter(t => t.conversation_id !== conversationId);
          return [...filtered, ...currentTyping];
        });
        
        setOnlineUsers(currentOnline);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('🎭 usePresenceManager - User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('🎭 usePresenceManager - User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track initial presence
          await channel.track({
            user_id: user.id,
            username: user.email?.split('@')[0] || 'Anonymous',
            avatar_url: user.user_metadata?.avatar_url,
            status: 'online',
            typing: false,
            typing_timestamp: 0,
            last_seen: Date.now()
          });
        }
      });

    channels.set(conversationId, channel);
    setChannels(new Map(channels));

    // Cleanup function
    return () => {
      console.log('🎭 usePresenceManager - Cleaning up presence for conversation:', conversationId);
      supabase.removeChannel(channel);
      channels.delete(conversationId);
      setChannels(new Map(channels));
      
      // Remove typing users from this conversation
      setTypingUsers(prev => prev.filter(t => t.conversation_id !== conversationId));
    };
  }, [user, channels]);

  // Send typing indicator
  const sendTypingIndicator = useCallback(async (conversationId: string, isTyping: boolean) => {
    if (!user) return;

    const channel = channels.get(conversationId);
    if (!channel) return;

    console.log('⌨️ usePresenceManager - Sending typing indicator:', {
      conversationId,
      isTyping,
      userId: user.id
    });

    try {
      await channel.track({
        user_id: user.id,
        username: user.email?.split('@')[0] || 'Anonymous',
        avatar_url: user.user_metadata?.avatar_url,
        status: 'online',
        typing: isTyping,
        typing_timestamp: isTyping ? Date.now() : 0,
        last_seen: Date.now()
      });
    } catch (error) {
      console.error('🎭 usePresenceManager - Error sending typing indicator:', error);
    }
  }, [user, channels]);

  // Update user status
  const updateUserStatus = useCallback(async (conversationId: string, status: 'online' | 'away' | 'offline') => {
    if (!user) return;

    const channel = channels.get(conversationId);
    if (!channel) return;

    console.log('🎭 usePresenceManager - Updating user status:', {
      conversationId,
      status,
      userId: user.id
    });

    try {
      await channel.track({
        user_id: user.id,
        username: user.email?.split('@')[0] || 'Anonymous',
        avatar_url: user.user_metadata?.avatar_url,
        status,
        typing: false,
        typing_timestamp: 0,
        last_seen: Date.now()
      });
    } catch (error) {
      console.error('🎭 usePresenceManager - Error updating user status:', error);
    }
  }, [user, channels]);

  // Get typing users for a specific conversation
  const getTypingUsers = useCallback((conversationId: string) => {
    return typingUsers.filter(user => 
      user.conversation_id === conversationId &&
      Date.now() - user.timestamp < 5000 // Only show recent typing
    );
  }, [typingUsers]);

  // Get online users for a specific conversation
  const getOnlineUsers = useCallback((conversationId: string) => {
    return onlineUsers.filter(user => 
      user.status === 'online' &&
      Date.now() - user.last_seen < 30000 // Consider online if seen in last 30s
    );
  }, [onlineUsers]);

  // Check if user is online
  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers.some(user => 
      user.user_id === userId && 
      user.status === 'online' &&
      Date.now() - user.last_seen < 30000 // Consider online if seen in last 30s
    );
  }, [onlineUsers]);

  // Cleanup typing indicators periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers(prev => 
        prev.filter(user => Date.now() - user.timestamp < 5000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Cleanup all channels on unmount
  useEffect(() => {
    return () => {
      console.log('🎭 usePresenceManager - Cleaning up all channels');
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, []);

  return {
    typingUsers,
    onlineUsers,
    setupConversationPresence,
    sendTypingIndicator,
    updateUserStatus,
    getTypingUsers,
    getOnlineUsers,
    isUserOnline
  };
};
