
import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
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
  const [joinedConversations, setJoinedConversations] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { joinConversation, leaveConversation, emitTypingStart, emitTypingStop, onEvent, connected } = useSocket();

  const setupConversationPresence = useCallback((conversationId: string) => {
    if (!user || joinedConversations.has(conversationId)) return;

    joinConversation(conversationId);
    setJoinedConversations(prev => new Set([...prev, conversationId]));

    return () => {
      leaveConversation(conversationId);
      setJoinedConversations(prev => {
        const next = new Set(prev);
        next.delete(conversationId);
        return next;
      });
      setTypingUsers(prev => prev.filter(t => t.conversation_id !== conversationId));
    };
  }, [user, joinedConversations, joinConversation, leaveConversation]);

  const sendTypingIndicator = useCallback(async (conversationId: string, isTyping: boolean) => {
    if (!user) return;
    if (isTyping) {
      emitTypingStart(conversationId);
    } else {
      emitTypingStop(conversationId);
    }
  }, [user, emitTypingStart, emitTypingStop]);

  const updateUserStatus = useCallback(async (_conversationId: string, _status: 'online' | 'away' | 'offline') => {
  }, []);

  const getTypingUsers = useCallback((conversationId: string) => {
    return typingUsers.filter(u =>
      u.conversation_id === conversationId &&
      Date.now() - u.timestamp < 5000
    );
  }, [typingUsers]);

  const getOnlineUsers = useCallback((_conversationId: string) => {
    return onlineUsers.filter(u =>
      u.status === 'online' &&
      Date.now() - u.last_seen < 30000
    );
  }, [onlineUsers]);

  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers.some(u =>
      u.user_id === userId &&
      u.status === 'online' &&
      Date.now() - u.last_seen < 30000
    );
  }, [onlineUsers]);

  useEffect(() => {
    if (!user || !connected) return;

    const cleanupStart = onEvent('typing:start', (data: { userId: string; userName: string; conversationId: string }) => {
      if (data.userId !== user.id) {
        setTypingUsers(prev => {
          const filtered = prev.filter(t => !(t.user_id === data.userId && t.conversation_id === data.conversationId));
          return [...filtered, {
            user_id: data.userId,
            username: data.userName || 'Unknown User',
            conversation_id: data.conversationId,
            timestamp: Date.now(),
          }];
        });
      }
    });

    const cleanupStop = onEvent('typing:stop', (data: { userId: string; conversationId: string }) => {
      if (data.userId !== user.id) {
        setTypingUsers(prev => prev.filter(t => !(t.user_id === data.userId && t.conversation_id === data.conversationId)));
      }
    });

    const cleanupOnline = onEvent('presence:online', (data: { userId: string; userName: string; conversationId: string }) => {
      setOnlineUsers(prev => {
        const filtered = prev.filter(u => u.user_id !== data.userId);
        return [...filtered, {
          user_id: data.userId,
          username: data.userName || 'Unknown User',
          status: 'online' as const,
          last_seen: Date.now(),
        }];
      });
    });

    const cleanupOffline = onEvent('presence:offline', (data: { userId: string }) => {
      setOnlineUsers(prev => prev.filter(u => u.user_id !== data.userId));
    });

    return () => {
      cleanupStart();
      cleanupStop();
      cleanupOnline();
      cleanupOffline();
    };
  }, [user, connected, onEvent]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers(prev => prev.filter(u => Date.now() - u.timestamp < 5000));
    }, 1000);
    return () => clearInterval(interval);
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
