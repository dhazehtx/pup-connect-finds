
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TypingUser {
  id: string;
  name: string;
  avatar?: string;
}

export const useRealtimeTyping = () => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const { user } = useAuth();

  const sendTypingIndicator = useCallback(async (conversationId: string, isTyping: boolean) => {
    if (!user) return;

    try {
      const channel = supabase.channel(`typing-${conversationId}`);
      
      if (isTyping) {
        await channel.track({
          user_id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
          avatar: user.user_metadata?.avatar_url,
          typing: true,
          timestamp: Date.now()
        });
      } else {
        await channel.untrack();
      }
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }, [user]);

  const setupTypingSubscription = useCallback((conversationId: string) => {
    if (!user) return () => {};

    const channel = supabase
      .channel(`typing-${conversationId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: TypingUser[] = [];
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.user_id !== user.id && presence.typing) {
              // Check if timestamp is recent (within last 5 seconds)
              const isRecent = Date.now() - presence.timestamp < 5000;
              if (isRecent) {
                users.push({
                  id: presence.user_id,
                  name: presence.name,
                  avatar: presence.avatar
                });
              }
            }
          });
        });
        
        setTypingUsers(users);
      })
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
      setTypingUsers([]);
    };
  }, [user]);

  return {
    typingUsers,
    sendTypingIndicator,
    setupTypingSubscription
  };
};
