
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/messaging';

export const useMessageSearch = () => {
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();

  const searchMessages = useCallback(async (query: string, conversationId?: string) => {
    if (!user || !query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      let queryBuilder = supabase
        .from('messages')
        .select('*')
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false });

      if (conversationId) {
        queryBuilder = queryBuilder.eq('conversation_id', conversationId);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching messages:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [user]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
  }, []);

  return {
    searchResults,
    isSearching,
    searchMessages,
    clearSearch
  };
};
