
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useTypingIndicator = (conversationId: string) => {
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
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
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Auto-stop typing after 3 seconds
    const newTimeout = setTimeout(() => {
      setIsTyping(false);
      broadcastTyping(false);
    }, 3000);
    
    setTypingTimeout(newTimeout);
  }, [broadcastTyping, typingTimeout]);

  const stopTyping = useCallback(() => {
    setIsTyping(false);
    broadcastTyping(false);
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
  }, [broadcastTyping, typingTimeout]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`typing-${conversationId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user_id, typing } = payload.payload;
        
        // Only show typing indicator for other users
        if (user_id !== user.id) {
          setOtherUserTyping(typing);
          
          // Auto-hide typing indicator after 5 seconds
          if (typing) {
            setTimeout(() => setOtherUserTyping(false), 5000);
          }
        }
      })
      .subscribe();

    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      supabase.removeChannel(channel);
    };
  }, [conversationId, user, typingTimeout]);

  return {
    isTyping,
    otherUserTyping,
    startTyping,
    stopTyping
  };
};
