
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';

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
      
      const params = new URLSearchParams({ q: query });
      if (conversationId) {
        params.append('conversation_id', conversationId);
      }
      
      const data = await apiRequest(`/messaging/search?${params.toString()}`);

      const formattedResults: SearchResult[] = (Array.isArray(data) ? data : []).map((msg: any) => ({
        id: msg.id,
        content: msg.content || '',
        sender_id: msg.sender_id,
        created_at: msg.created_at,
        conversation_id: msg.conversation_id,
        message_type: msg.message_type || 'text',
        sender_name: msg.sender_profile?.full_name || msg.sender_profile?.username || 'Unknown User'
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
    isSearching: searching
  };
};
