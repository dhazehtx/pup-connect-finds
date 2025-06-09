
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useMessageSearch = () => {
  const { user } = useAuth();

  const searchMessages = useCallback(async (query: string, conversationId?: string) => {
    try {
      let queryBuilder = supabase
        .from('messages')
        .select('*')
        .ilike('content', `%${query}%`);

      if (conversationId) {
        queryBuilder = queryBuilder.eq('conversation_id', conversationId);
      } else if (user) {
        // Search in user's conversations only
        const { data: userConversations } = await supabase
          .from('conversations')
          .select('id')
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

        if (userConversations) {
          const conversationIds = userConversations.map(c => c.id);
          queryBuilder = queryBuilder.in('conversation_id', conversationIds);
        }
      }

      const { data, error } = await queryBuilder
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }, [user]);

  return {
    searchMessages,
  };
};
