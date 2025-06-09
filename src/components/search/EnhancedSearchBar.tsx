
import React, { useState } from 'react';
import SearchInput from './SearchInput';
import QuickFilterSelects from './QuickFilterSelects';
import FilterPopovers from './FilterPopovers';
import ActiveFiltersDisplay from './ActiveFiltersDisplay';

interface SearchFilters {
  query: string;
  breed: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  minAge: number;
  maxAge: number;
}

interface EnhancedSearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  loading?: boolean;
}

const EnhancedSearchBar = ({ onSearch, loading }: EnhancedSearchBarProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    breed: '',
    location: '',
    minPrice: 0,
    maxPrice: 5000,
    minAge: 0,
    maxAge: 15,
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    const defaultFilters = {
      query: '',
      breed: '',
      location: '',
      minPrice: 0,
      maxPrice: 5000,
      minAge: 0,
      maxAge: 15,
    };
    setFilters(defaultFilters);
    onSearch(defaultFilters);
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <SearchInput
        query={filters.query}
        onQueryChange={(value) => handleFilterChange('query', value)}
        onSearch={handleSearch}
        loading={loading}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
      />

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <QuickFilterSelects
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        <FilterPopovers
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Active Filters Display */}
      <ActiveFiltersDisplay filters={filters} />
    </div>
  );
};

export default EnhancedSearchBar;
