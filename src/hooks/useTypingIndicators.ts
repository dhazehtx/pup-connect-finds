
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const startTyping = useCallback((conversationId: string) => {
    if (!user) return;

    const channel = supabase.channel(`typing-${conversationId}`);
    channel.track({
      user_id: user.id,
      username: user.email || 'Anonymous',
      conversation_id: conversationId,
      is_typing: true,
      timestamp: Date.now()
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(conversationId);
    }, 3000);
  }, [user]);

  const stopTyping = useCallback((conversationId: string) => {
    if (!user) return;

    const channel = supabase.channel(`typing-${conversationId}`);
    channel.track({
      user_id: user.id,
      username: user.email || 'Anonymous',
      conversation_id: conversationId,
      is_typing: false,
      timestamp: Date.now()
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [user]);

  const getTypingUsers = useCallback((conversationId: string) => {
    return typingUsers.filter(u => 
      u.conversation_id === conversationId && 
      u.user_id !== user?.id &&
      Date.now() - u.timestamp < 5000 // Consider typing for 5 seconds
    );
  }, [typingUsers, user]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    typingUsers,
    startTyping,
    stopTyping,
    getTypingUsers
  };
};
