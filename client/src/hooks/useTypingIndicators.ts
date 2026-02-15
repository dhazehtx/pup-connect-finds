
import { useState, useCallback, useRef, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';

interface TypingUser {
  user_id: string;
  username: string;
  conversation_id: string;
  timestamp: number;
}

export const useTypingIndicators = () => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const { user } = useAuth();
  const { emitTypingStart, emitTypingStop, onEvent } = useSocket();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const startTyping = useCallback((conversationId: string) => {
    if (!user) return;
    emitTypingStart(conversationId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(conversationId);
    }, 3000);
  }, [user, emitTypingStart]);

  const stopTyping = useCallback((conversationId: string) => {
    if (!user) return;
    emitTypingStop(conversationId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [user, emitTypingStop]);

  const getTypingUsers = useCallback((conversationId: string) => {
    return typingUsers.filter(u =>
      u.conversation_id === conversationId &&
      u.user_id !== user?.id &&
      Date.now() - u.timestamp < 5000
    );
  }, [typingUsers, user]);

  useEffect(() => {
    if (!user) return;

    const cleanupStart = onEvent('typing:start', (data: { userId: string; userName: string; conversationId: string }) => {
      if (data.userId !== user.id) {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => !(u.user_id === data.userId && u.conversation_id === data.conversationId));
          return [...filtered, {
            user_id: data.userId,
            username: data.userName || 'Someone',
            conversation_id: data.conversationId,
            timestamp: Date.now(),
          }];
        });
      }
    });

    const cleanupStop = onEvent('typing:stop', (data: { userId: string; conversationId: string }) => {
      if (data.userId !== user.id) {
        setTypingUsers(prev => prev.filter(u => !(u.user_id === data.userId && u.conversation_id === data.conversationId)));
      }
    });

    return () => {
      cleanupStart();
      cleanupStop();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [user, onEvent]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers(prev => prev.filter(u => Date.now() - u.timestamp < 5000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    typingUsers,
    startTyping,
    stopTyping,
    getTypingUsers
  };
};
