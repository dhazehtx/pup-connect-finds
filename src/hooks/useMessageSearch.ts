
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SearchResult {
  id: string;
  content: string;
  conversation_id: string;
  created_at: string;
  sender_name?: string;
}

export const useMessageSearch = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const searchMessages = useCallback(async (query: string, conversationId?: string) => {
    if (!user || !query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      
      let queryBuilder = supabase
        .from('messages')
        .select(`
          id,
          content,
          conversation_id,
          created_at,
          profiles:sender_id (
            full_name
          )
        `)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(50);

      // Filter by conversation if specified
      if (conversationId) {
        queryBuilder = queryBuilder.eq('conversation_id', conversationId);
      } else {
        // Only search in conversations where user is participant
        const { data: userConversations } = await supabase
          .from('conversations')
          .select('id')
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

        if (userConversations) {
          const conversationIds = userConversations.map(c => c.id);
          queryBuilder = queryBuilder.in('conversation_id', conversationIds);
        }
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      const formattedResults = (data || []).map(message => ({
        ...message,
        sender_name: message.profiles?.full_name || 'Unknown User'
      }));

      setSearchResults(formattedResults);
    } catch (error) {
      console.error('Error searching messages:', error);
      toast({
        title: "Search failed",
        description: "Failed to search messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  }, [user, toast]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
  }, []);

  return {
    searchResults,
    searching,
    searchMessages,
    clearSearch
  };
};
