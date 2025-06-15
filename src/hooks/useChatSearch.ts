
import { useState, useMemo } from 'react';
import { Message } from '@/types/chat';

interface SearchResult {
  message: Message;
  matchedText: string;
  index: number;
}

export const useChatSearch = (messages: Message[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(-1);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    messages.forEach((message, index) => {
      if (message.content?.toLowerCase().includes(query)) {
        const matchStart = message.content.toLowerCase().indexOf(query);
        const matchEnd = matchStart + query.length;
        const contextStart = Math.max(0, matchStart - 20);
        const contextEnd = Math.min(message.content.length, matchEnd + 20);
        
        results.push({
          message,
          matchedText: message.content.substring(contextStart, contextEnd),
          index
        });
      }
    });

    return results;
  }, [messages, searchQuery]);

  const navigateToResult = (resultIndex: number) => {
    if (resultIndex >= 0 && resultIndex < searchResults.length) {
      setCurrentIndex(resultIndex);
      return searchResults[resultIndex].index;
    }
    return -1;
  };

  const nextResult = () => {
    const newIndex = currentIndex + 1;
    if (newIndex < searchResults.length) {
      return navigateToResult(newIndex);
    }
    return -1;
  };

  const previousResult = () => {
    const newIndex = currentIndex - 1;
    if (newIndex >= 0) {
      return navigateToResult(newIndex);
    }
    return -1;
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentIndex(-1);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    currentIndex,
    navigateToResult,
    nextResult,
    previousResult,
    clearSearch,
    hasResults: searchResults.length > 0
  };
};
