
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useRealtimeTyping = () => {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sendTypingIndicator = (conversationId: string, isTyping: boolean) => {
    if (!user) return;

    const channel = supabase.channel(`typing_${conversationId}`);
    
    if (isTyping) {
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { 
          user_id: user.id,
          typing: true,
          timestamp: Date.now()
        }
      });
    } else {
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { 
          user_id: user.id,
          typing: false,
          timestamp: Date.now()
        }
      });
    }
  };

  const setupTypingSubscription = (conversationId: string) => {
    const channel = supabase
      .channel(`typing_${conversationId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user_id, typing } = payload.payload;
        
        if (user_id !== user?.id) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (typing) {
              newSet.add(user_id);
              
              // Auto-remove after 5 seconds
              setTimeout(() => {
                setTypingUsers(current => {
                  const updated = new Set(current);
                  updated.delete(user_id);
                  return updated;
                });
              }, 5000);
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
  };

  return {
    typingUsers,
    sendTypingIndicator,
    setupTypingSubscription
  };
};
