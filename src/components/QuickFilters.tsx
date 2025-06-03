
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import SearchFilters from './SearchFilters';

interface FilterState {
  searchTerm: string;
  breed: string;
  minPrice: string;
  maxPrice: string;
  ageGroup: string;
  gender: string;
  sourceType: string;
  maxDistance: string;
  verifiedOnly: boolean;
  availableOnly: boolean;
}

interface QuickFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

const QuickFilters = ({ filters, onFiltersChange, onClearFilters }: QuickFiltersProps) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const popularBreeds = [
    'French Bulldog',
    'Golden Retriever', 
    'German Shepherd',
    'Labrador',
    'Beagle'
  ];

  const quickFilters = [
    { label: 'Under $1000', filter: { maxPrice: '1000' } },
    { label: 'Puppies Only', filter: { ageGroup: 'puppy' } },
    { label: 'Verified Only', filter: { verifiedOnly: true } },
    { label: 'Nearby (10mi)', filter: { maxDistance: '10' } }
  ];

  const handleBreedClick = (breed: string) => {
    onFiltersChange({ ...filters, breed: breed.toLowerCase() });
  };

  const handleQuickFilterClick = (filterUpdate: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...filterUpdate });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, searchTerm: e.target.value });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'searchTerm') return value.length > 0;
    if (typeof value === 'boolean') return value;
    return value !== '' && value !== 'all';
  }).length;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="space-y-4">
          {/* Search Bar with Filter Button */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by breed, breeder name, or keywords..."
                value={filters.searchTerm}
                onChange={handleSearchChange}
                className="pl-10 bg-white border-gray-200 focus:border-royal-blue"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 bg-white hover:bg-soft-sky border-gray-200 relative text-black"
            >
              <Filter size={18} />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-1 bg-royal-blue text-white text-xs min-w-[20px] h-5">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Popular Breeds */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Breeds</h3>
            <div className="flex flex-wrap gap-2">
              {popularBreeds.map((breed) => (
                <Button
                  key={breed}
                  variant={filters.breed === breed.toLowerCase() ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleBreedClick(breed)}
                  className={`${
                    filters.breed === breed.toLowerCase() 
                      ? 'bg-royal-blue text-white' 
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-soft-sky'
                  }`}
                >
                  {breed}
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Filters */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Filters</h3>
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((item) => (
                <Button
                  key={item.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFilterClick(item.filter)}
                  className="bg-white border-gray-200 text-gray-700 hover:bg-soft-sky"
                >
                  {item.label}
                </Button>
              ))}
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Clear All ({activeFiltersCount})
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <SearchFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
          resultsCount={0}
          onClearFilters={onClearFilters}
        />
      )}
    </div>
  );
};

export default QuickFilters;
