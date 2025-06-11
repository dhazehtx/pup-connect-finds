
import React, { useEffect } from 'react';
import SearchInput from './search/SearchInput';
import SearchFilters from './search/SearchFilters';
import SearchSummary from './search/SearchSummary';
import SearchResults from './search/SearchResults';
import { useAdvancedMessageSearch } from '@/hooks/useAdvancedMessageSearch';

interface AdvancedMessageSearchProps {
  messages: any[];
  onSearchResults: (results: any[]) => void;
  onClearSearch: () => void;
  onResultSelect?: (messageId: string) => void;
  conversationId?: string;
}

const AdvancedMessageSearch = ({ 
  messages, 
  onSearchResults, 
  onClearSearch,
  onResultSelect,
  conversationId 
}: AdvancedMessageSearchProps) => {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    localResults,
    showResults,
    performLocalSearch,
    handleClearSearch,
    hasActiveFilters
  } = useAdvancedMessageSearch({ messages, onSearchResults, onClearSearch });

  // Search as user types
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performLocalSearch(searchQuery, filters);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filters, performLocalSearch]);

  return (
    <div className="p-3 border-b bg-background">
      <div className="flex items-center gap-2">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={handleClearSearch}
          hasActiveFilters={hasActiveFilters}
        />
        
        {hasActiveFilters && (
          <SearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            isOpen={isFilterOpen}
            onOpenChange={setIsFilterOpen}
          />
        )}
      </div>

      <SearchSummary
        resultCount={localResults.length}
        activeFilters={filters}
        showResults={showResults}
      />

      <SearchResults
        results={localResults}
        onResultSelect={onResultSelect}
        showResults={showResults}
      />
    </div>
  );
};

export default AdvancedMessageSearch;
