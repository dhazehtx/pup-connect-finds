
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useRealtimeTyping = () => {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const sendTypingIndicator = useCallback(async (conversationId: string, isTyping: boolean) => {
    if (!user) return;

    try {
      await supabase
        .channel(`typing:${conversationId}`)
        .send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            user_id: user.id,
            is_typing: isTyping,
            conversation_id: conversationId
          }
        });
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }, [user]);

  const setupTypingSubscription = useCallback((conversationId: string) => {
    if (!user) return null;

    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user_id, is_typing } = payload.payload;
        
        if (user_id !== user.id) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (is_typing) {
              newSet.add(user_id);
            } else {
              newSet.delete(user_id);
            }
            return newSet;
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    typingUsers,
    sendTypingIndicator,
    setupTypingSubscription
  };
};
