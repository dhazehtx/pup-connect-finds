
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';

export const useTypingIndicator = (conversationId: string) => {
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const { emitTypingStart, emitTypingStop, onEvent } = useSocket();

  const startTyping = useCallback(() => {
    setIsTyping(true);
    emitTypingStart(conversationId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitTypingStop(conversationId);
    }, 3000);
  }, [conversationId, emitTypingStart, emitTypingStop]);

  const stopTyping = useCallback(() => {
    setIsTyping(false);
    emitTypingStop(conversationId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [conversationId, emitTypingStop]);

  useEffect(() => {
    if (!user) return;

    const cleanupStart = onEvent('typing:start', (data: { userId: string; conversationId: string }) => {
      if (data.userId !== user.id && data.conversationId === conversationId) {
        setOtherUserTyping(true);
        setTimeout(() => setOtherUserTyping(false), 5000);
      }
    });

    const cleanupStop = onEvent('typing:stop', (data: { userId: string; conversationId: string }) => {
      if (data.userId !== user.id && data.conversationId === conversationId) {
        setOtherUserTyping(false);
      }
    });

    return () => {
      cleanupStart();
      cleanupStop();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId, user, onEvent]);

  return {
    isTyping,
    otherUserTyping,
    startTyping,
    stopTyping
  };
};
