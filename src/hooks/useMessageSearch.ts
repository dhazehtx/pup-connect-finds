
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SearchResult {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  conversation_id: string;
}

export const useMessageSearch = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const searchMessages = async (query: string, conversationId?: string) => {
    if (!user || !query.trim()) return;

    setIsSearching(true);
    try {
      let queryBuilder = supabase
        .from('messages')
        .select('id, content, created_at, sender_id, conversation_id')
        .textSearch('content', query)
        .order('created_at', { ascending: false })
        .limit(50);

      if (conversationId) {
        queryBuilder = queryBuilder.eq('conversation_id', conversationId);
      } else {
        // Search only in conversations where user is participant
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
      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Unable to search messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const clearResults = () => {
    setSearchResults([]);
  };

  return {
    searchResults,
    isSearching,
    searchMessages,
    clearResults
  };
};
