
import { useState, useCallback } from 'react';

interface SearchFilters {
  messageTypes: string[];
  dateRange: {
    start: string;
    end: string;
  };
  sender: string;
}

interface UseAdvancedMessageSearchProps {
  messages: any[];
  onSearchResults: (results: any[]) => void;
  onClearSearch: () => void;
}

export const useAdvancedMessageSearch = ({ 
  messages, 
  onSearchResults, 
  onClearSearch 
}: UseAdvancedMessageSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    messageTypes: [],
    dateRange: { start: '', end: '' },
    sender: 'all'
  });
  const [localResults, setLocalResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const performLocalSearch = useCallback((query: string, appliedFilters: SearchFilters) => {
    if (!query.trim() && appliedFilters.messageTypes.length === 0 && 
        !appliedFilters.dateRange.start && !appliedFilters.dateRange.end && 
        appliedFilters.sender === 'all') {
      setLocalResults([]);
      setShowResults(false);
      onClearSearch();
      return;
    }

    let results = messages.filter(message => {
      // Text search
      if (query.trim() && !message.content?.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      
      // Message type filter
      if (appliedFilters.messageTypes.length > 0 && !appliedFilters.messageTypes.includes(message.message_type)) {
        return false;
      }
      
      // Date range filter
      if (appliedFilters.dateRange.start && new Date(message.created_at) < new Date(appliedFilters.dateRange.start)) {
        return false;
      }
      if (appliedFilters.dateRange.end && new Date(message.created_at) > new Date(appliedFilters.dateRange.end)) {
        return false;
      }
      
      // Sender filter
      if (appliedFilters.sender && appliedFilters.sender !== 'all' && message.sender_id !== appliedFilters.sender) {
        return false;
      }
      
      return true;
    });

    // Sort by relevance (most recent first)
    results = results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    console.log('🔍 AdvancedMessageSearch - Search results:', {
      query,
      filters: appliedFilters,
      resultCount: results.length
    });

    setLocalResults(results);
    setShowResults(true);
    onSearchResults(results);
  }, [messages, onSearchResults, onClearSearch]);

  const handleClearSearch = () => {
    console.log('🔍 AdvancedMessageSearch - Clearing search');
    setSearchQuery('');
    setFilters({
      messageTypes: [],
      dateRange: { start: '', end: '' },
      sender: 'all'
    });
    setLocalResults([]);
    setShowResults(false);
    onClearSearch();
  };

  const hasActiveFilters = searchQuery.trim() !== '' ||
    filters.messageTypes.length > 0 ||
    filters.dateRange.start !== '' ||
    filters.dateRange.end !== '' ||
    filters.sender !== 'all';

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    localResults,
    showResults,
    performLocalSearch,
    handleClearSearch,
    hasActiveFilters
  };
};
