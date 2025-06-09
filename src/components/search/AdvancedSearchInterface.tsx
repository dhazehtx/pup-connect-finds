
import React, { useState, useEffect } from 'react';
import { Search, Filter, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { useDebounce } from '@/hooks/useDebounce';
import SearchFiltersCard from './SearchFiltersCard';
import SearchSuggestionsDropdown from './SearchSuggestionsDropdown';
import SearchResultsGrid from './SearchResultsGrid';
import SaveSearchCard from './SaveSearchCard';

interface SearchFilters {
  query?: string;
  breed?: string;
  minPrice?: number;
  maxPrice?: number;
  minAge?: number;
  maxAge?: number;
  location?: string;
  userType?: 'breeder' | 'shelter';
  verified?: boolean;
}

const AdvancedSearchInterface = () => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  const {
    searchResults,
    savedSearches,
    suggestions,
    loading,
    performSearch,
    getSearchSuggestions,
    saveSearch,
    deleteSavedSearch
  } = useAdvancedSearch();

  const debouncedQuery = useDebounce(filters.query || '', 300);

  // Get suggestions when query changes
  useEffect(() => {
    if (debouncedQuery) {
      getSearchSuggestions(debouncedQuery);
    }
  }, [debouncedQuery, getSearchSuggestions]);

  // Perform search when filters change
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      performSearch(filters);
    }
  }, [filters, performSearch]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleSaveSearch = async () => {
    if (saveSearchName.trim()) {
      await saveSearch(saveSearchName, filters, true);
      setSaveSearchName('');
      setShowSaveDialog(false);
    }
  };

  const loadSavedSearch = (search: any) => {
    setFilters(search.filters);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search for dogs, breeds, or locations..."
              value={filters.query || ''}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="pl-10"
            />
            
            <SearchSuggestionsDropdown
              suggestions={suggestions}
              query={filters.query || ''}
              onSuggestionSelect={(suggestion) => handleFilterChange('query', suggestion)}
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} className="mr-2" />
            Filters
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowSaveDialog(true)}
            disabled={Object.keys(filters).length === 0}
          >
            <Save size={16} className="mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <SearchFiltersCard
        showFilters={showFilters}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {savedSearches.map((search) => (
                <Badge
                  key={search.id}
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-200 pr-1"
                >
                  <span onClick={() => loadSavedSearch(search)}>{search.name}</span>
                  <button
                    onClick={() => deleteSavedSearch(search.id)}
                    className="ml-2 hover:text-red-600"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Search Dialog */}
      <SaveSearchCard
        showSaveDialog={showSaveDialog}
        saveSearchName={saveSearchName}
        onSaveSearchNameChange={setSaveSearchName}
        onSaveSearch={handleSaveSearch}
        onCloseSaveDialog={() => setShowSaveDialog(false)}
      />

      {/* Search Results */}
      <SearchResultsGrid results={searchResults} loading={loading} />
    </div>
  );
};

export default AdvancedSearchInterface;
