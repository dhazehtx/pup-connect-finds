
import { useState, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';

interface TypingUser {
  id: string;
  name: string;
  avatar?: string;
}

export const useRealtimeTyping = () => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const { user } = useAuth();
  const { emitTypingStart, emitTypingStop, onEvent, joinConversation, leaveConversation } = useSocket();

  const sendTypingIndicator = useCallback(async (conversationId: string, isTyping: boolean) => {
    if (!user) return;
    if (isTyping) {
      emitTypingStart(conversationId);
    } else {
      emitTypingStop(conversationId);
    }
  }, [user, emitTypingStart, emitTypingStop]);

  const setupTypingSubscription = useCallback((conversationId: string) => {
    if (!user) return () => {};

    joinConversation(conversationId);

    const cleanupStart = onEvent('typing:start', (data: { userId: string; userName: string; conversationId: string }) => {
      if (data.userId !== user.id && data.conversationId === conversationId) {
        setTypingUsers(prev => {
          if (prev.some(u => u.id === data.userId)) return prev;
          return [...prev, { id: data.userId, name: data.userName }];
        });
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.id !== data.userId));
        }, 5000);
      }
    });

    const cleanupStop = onEvent('typing:stop', (data: { userId: string; conversationId: string }) => {
      if (data.userId !== user.id && data.conversationId === conversationId) {
        setTypingUsers(prev => prev.filter(u => u.id !== data.userId));
      }
    });

    return () => {
      leaveConversation(conversationId);
      cleanupStart();
      cleanupStop();
      setTypingUsers([]);
    };
  }, [user, joinConversation, leaveConversation, onEvent]);

  return {
    typingUsers,
    sendTypingIndicator,
    setupTypingSubscription
  };
};
