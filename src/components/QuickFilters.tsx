
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'searchTerm') return value.length > 0;
    if (typeof value === 'boolean') return value;
    return value !== '' && value !== 'all';
  }).length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="space-y-3">
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
  );
};

export default QuickFilters;
