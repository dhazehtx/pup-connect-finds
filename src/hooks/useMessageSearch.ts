
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SearchResult {
  id: string;
  content: string;
  message_type: string;
  created_at: string;
  conversation_id: string;
  sender_id: string;
}

interface SearchFilters {
  messageTypes?: string[];
  dateRange?: { start: string; end: string };
  sender?: string;
}

export const useMessageSearch = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();

  const searchMessages = useCallback(async (
    query: string, 
    conversationId?: string,
    filters?: SearchFilters
  ) => {
    if (!user || !query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      let queryBuilder = supabase
        .from('messages')
        .select('id, content, message_type, created_at, conversation_id, sender_id')
        .ilike('content', `%${query}%`);

      // Filter by conversation if provided
      if (conversationId) {
        queryBuilder = queryBuilder.eq('conversation_id', conversationId);
      } else {
        // Only search in conversations where user is a participant
        const { data: userConversations, error: convError } = await supabase
          .from('conversations')
          .select('id')
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
        
        if (convError) {
          console.error('Error fetching user conversations:', convError);
          setSearchResults([]);
          setIsSearching(false);
          return;
        }
        
        const conversationIds = userConversations?.map(c => c.id) || [];
        if (conversationIds.length > 0) {
          queryBuilder = queryBuilder.in('conversation_id', conversationIds);
        } else {
          // User has no conversations, return empty results
          setSearchResults([]);
          setIsSearching(false);
          return;
        }
      }

      // Apply filters
      if (filters?.messageTypes && filters.messageTypes.length > 0) {
        queryBuilder = queryBuilder.in('message_type', filters.messageTypes);
      }

      if (filters?.dateRange?.start && filters?.dateRange?.end) {
        queryBuilder = queryBuilder
          .gte('created_at', filters.dateRange.start)
          .lte('created_at', filters.dateRange.end);
      }

      // Order by relevance (most recent first)
      queryBuilder = queryBuilder.order('created_at', { ascending: false }).limit(50);

      const { data, error } = await queryBuilder;

      if (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } else {
        let results = data || [];

        // Apply sender filter if provided (client-side filtering for now)
        if (filters?.sender) {
          results = results.filter(result => 
            result.sender_id === filters.sender
          );
        }

        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [user]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  return {
    searchResults,
    isSearching,
    searchMessages,
    clearSearch
  };
};
