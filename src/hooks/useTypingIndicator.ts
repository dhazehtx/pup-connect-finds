
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useTypingIndicator = (conversationId: string) => {
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const { user } = useAuth();

  const broadcastTyping = useCallback(async (typing: boolean) => {
    if (!user) return;

    const channel = supabase.channel(`typing-${conversationId}`);
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user.id,
        typing,
        timestamp: new Date().toISOString()
      }
    });
  }, [conversationId, user]);

  const startTyping = useCallback(() => {
    setIsTyping(true);
    broadcastTyping(true);
  }, [broadcastTyping]);

  const stopTyping = useCallback(() => {
    setIsTyping(false);
    broadcastTyping(false);
  }, [broadcastTyping]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`typing-${conversationId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user_id, typing } = payload.payload;
        
        // Only show typing indicator for other users
        if (user_id !== user.id) {
          setOtherUserTyping(typing);
          
          // Auto-hide typing indicator after 3 seconds
          if (typing) {
            setTimeout(() => setOtherUserTyping(false), 3000);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  return {
    isTyping,
    otherUserTyping,
    startTyping,
    stopTyping
  };
};
