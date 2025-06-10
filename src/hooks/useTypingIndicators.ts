
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

    try {
      await supabase
        .from('typing_indicators')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          is_typing: true,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error starting typing indicator:', error);
    }
  }, [user]);

  const stopTyping = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('typing_indicators')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          is_typing: false,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error stopping typing indicator:', error);
    }
  }, [user]);

  const getTypingUsers = useCallback((conversationId: string) => {
    return typingUsers[conversationId] || [];
  }, [typingUsers]);

  // Set up real-time subscription for typing indicators
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('typing_indicators_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators'
        },
        async (payload) => {
          console.log('Typing indicator change:', payload);
          
          // Fetch current typing users for all conversations
          const { data, error } = await supabase
            .from('typing_indicators')
            .select(`
              conversation_id,
              user_id,
              is_typing,
              profiles:user_id (
                username,
                avatar_url
              )
            `)
            .eq('is_typing', true)
            .gte('updated_at', new Date(Date.now() - 10000).toISOString()); // Last 10 seconds

          if (error) {
            console.error('Error fetching typing indicators:', error);
            return;
          }

          const typingByConversation: Record<string, TypingUser[]> = {};
          (data || []).forEach(indicator => {
            if (indicator.user_id === user.id) return; // Don't show own typing

            if (!typingByConversation[indicator.conversation_id]) {
              typingByConversation[indicator.conversation_id] = [];
            }

            typingByConversation[indicator.conversation_id].push({
              user_id: indicator.user_id,
              username: indicator.profiles?.username || 'User',
              avatar_url: indicator.profiles?.avatar_url,
              conversation_id: indicator.conversation_id
            });
          });

          setTypingUsers(typingByConversation);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
    getTypingUsers
  };
};
