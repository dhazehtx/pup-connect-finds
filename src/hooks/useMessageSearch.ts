
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SearchResult {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  conversation_id: string;
  message_type: string;
  sender_name?: string;
}

export const useMessageSearch = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();

  const searchMessages = useCallback(async (query: string, conversationId?: string) => {
    if (!query.trim()) {
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
          sender_id,
          created_at,
          conversation_id,
          message_type,
          profiles:sender_id (
            full_name,
            username
          )
        `)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (conversationId) {
        queryBuilder = queryBuilder.eq('conversation_id', conversationId);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      const formattedResults: SearchResult[] = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content || '',
        sender_id: msg.sender_id,
        created_at: msg.created_at,
        conversation_id: msg.conversation_id,
        message_type: msg.message_type || 'text',
        sender_name: (msg.profiles as any)?.full_name || (msg.profiles as any)?.username || 'Unknown User'
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
  }, [toast]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
  }, []);

  return {
    searchResults,
    searching,
    searchMessages,
    clearSearch,
    isSearching: searching // Legacy compatibility
  };
};
