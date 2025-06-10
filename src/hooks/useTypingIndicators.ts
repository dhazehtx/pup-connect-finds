
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface TypingUser {
  user_id: string;
  username: string;
  avatar_url?: string;
  conversation_id: string;
}

export const useTypingIndicators = () => {
  const [typingUsers, setTypingUsers] = useState<Record<string, TypingUser[]>>({});
  const { user } = useAuth();

  const startTyping = useCallback(async (conversationId: string) => {
    if (!user) return;

    // Add current user to typing users for the conversation
    setTypingUsers(prev => ({
      ...prev,
      [conversationId]: [
        ...(prev[conversationId] || []).filter(u => u.user_id !== user.id),
        {
          user_id: user.id,
          username: user.email?.split('@')[0] || 'User',
          conversation_id: conversationId
        }
      ]
    }));

    // Remove typing indicator after 3 seconds
    setTimeout(() => {
      setTypingUsers(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).filter(u => u.user_id !== user.id)
      }));
    }, 3000);
  }, [user]);

  const stopTyping = useCallback(async (conversationId: string) => {
    if (!user) return;

    setTypingUsers(prev => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).filter(u => u.user_id !== user.id)
    }));
  }, [user]);

  const getTypingUsers = useCallback((conversationId: string) => {
    return typingUsers[conversationId] || [];
  }, [typingUsers]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
    getTypingUsers
  };
};
