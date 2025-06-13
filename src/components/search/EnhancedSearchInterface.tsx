
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import LocationFilter from './LocationFilter';
import SearchBar from './SearchBar';
import ActiveFilters from './ActiveFilters';
import AdvancedFilters from './AdvancedFilters';
import SortOptions from './SortOptions';
import SavedSearches from './SavedSearches';
import SaveSearchDialog from './SaveSearchDialog';

interface SearchFilters {
  query: string;
  breeds: string[];
  priceRange: [number, number];
  ageRange: [number, number];
  location?: any;
  radius: number;
  verified: boolean;
  sortBy: 'distance' | 'price' | 'date' | 'popularity';
  sortOrder: 'asc' | 'desc';
}

interface EnhancedSearchInterfaceProps {
  onSearch: (filters: SearchFilters) => void;
  availableBreeds: string[];
  savedSearches?: any[];
  onSaveSearch?: (filters: SearchFilters, name: string) => void;
}

const EnhancedSearchInterface = ({ 
  onSearch, 
  availableBreeds, 
  savedSearches = [],
  onSaveSearch 
}: EnhancedSearchInterfaceProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    breeds: [],
    priceRange: [0, 5000],
    ageRange: [0, 24],
    radius: 50,
    verified: false,
    sortBy: 'distance',
    sortOrder: 'asc'
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleBreedToggle = (breed: string) => {
    const newBreeds = filters.breeds.includes(breed)
      ? filters.breeds.filter(b => b !== breed)
      : [...filters.breeds, breed];
    handleFilterChange('breeds', newBreeds);
  };

  const handleLocationChange = (location: any, radius: number) => {
    setFilters(prev => ({ ...prev, location, radius }));
    onSearch({ ...filters, location, radius });
  };

  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      query: '',
      breeds: [],
      priceRange: [0, 5000],
      ageRange: [0, 24],
      radius: 50,
      verified: false,
      sortBy: 'distance',
      sortOrder: 'asc'
    };
    setFilters(defaultFilters);
    onSearch(defaultFilters);
  };

  const handleSaveSearch = (name: string, notifyOnNewMatches: boolean) => {
    if (onSaveSearch) {
      onSaveSearch(filters, name);
    }
    setShowSaveDialog(false);
  };

  const handleLoadSearch = (search: any) => {
    setFilters(search.filters);
    onSearch(search.filters);
  };

  return (
    <div className="space-y-4">
      {/* Main search bar */}
      <Card>
        <CardContent className="p-4">
          <SearchBar
            query={filters.query}
            onQueryChange={(query) => handleFilterChange('query', query)}
            onToggleFilters={() => setShowAdvanced(!showAdvanced)}
            onToggleSaveDialog={() => setShowSaveDialog(true)}
            onSuggestionSelect={(suggestion) => handleFilterChange('query', suggestion)}
          />

          <ActiveFilters
            breeds={filters.breeds}
            verified={filters.verified}
            location={filters.location}
            onBreedRemove={handleBreedToggle}
            onVerifiedToggle={() => handleFilterChange('verified', false)}
            onLocationRemove={() => handleFilterChange('location', null)}
            onClearAll={clearFilters}
          />
        </CardContent>
      </Card>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid md:grid-cols-2 gap-4">
          <LocationFilter
            onLocationChange={handleLocationChange}
            selectedLocation={filters.location}
            selectedRadius={filters.radius}
          />

          <AdvancedFilters
            priceRange={filters.priceRange}
            ageRange={filters.ageRange}
            breeds={filters.breeds}
            verified={filters.verified}
            availableBreeds={availableBreeds}
            onPriceRangeChange={(range) => handleFilterChange('priceRange', range)}
            onAgeRangeChange={(range) => handleFilterChange('ageRange', range)}
            onBreedToggle={handleBreedToggle}
            onVerifiedToggle={() => handleFilterChange('verified', !filters.verified)}
          />
        </div>
      )}

      <SortOptions
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
        onSortByChange={(sortBy) => handleFilterChange('sortBy', sortBy)}
        onSortOrderChange={(order) => handleFilterChange('sortOrder', order)}
      />

      <SavedSearches
        savedSearches={savedSearches}
        onLoadSearch={handleLoadSearch}
      />

      <SaveSearchDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onSave={handleSaveSearch}
        currentQuery={filters.query}
        currentFilters={filters}
      />
    </div>
  );
};

export default EnhancedSearchInterface;
