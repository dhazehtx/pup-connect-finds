
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useRealtimeTyping = () => {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const sendTypingIndicator = useCallback(async (conversationId: string, isTyping: boolean) => {
    if (!user) return;

    const channel = supabase.channel(`typing-${conversationId}`);
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user.id,
        typing: isTyping,
        timestamp: new Date().toISOString()
      }
    });
  }, [user]);

  const setupTypingSubscription = useCallback((conversationId: string) => {
    if (!user) return;

    const typingChannel = supabase
      .channel(`typing-${conversationId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user_id, typing } = payload.payload;
        
        if (user_id !== user.id) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (typing) {
              newSet.add(user_id);
              // Auto-remove after 3 seconds
              setTimeout(() => {
                setTypingUsers(current => {
                  const updated = new Set(current);
                  updated.delete(user_id);
                  return updated;
                });
              }, 3000);
            } else {
              newSet.delete(user_id);
            }
            return newSet;
          });
        }
      })
      .subscribe();

    return typingChannel;
  }, [user]);

  return {
    typingUsers,
    sendTypingIndicator,
    setupTypingSubscription,
  };
};
