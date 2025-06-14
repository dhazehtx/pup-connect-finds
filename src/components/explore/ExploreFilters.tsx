
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import QuickFiltersBar from '@/components/explore/QuickFiltersBar';
import PopularBreeds from '@/components/explore/PopularBreeds';
import AdvancedFiltersPanel from '@/components/explore/AdvancedFiltersPanel';
import SearchFiltersCard from '@/components/search/SearchFiltersCard';
import ErrorBoundary from '@/components/ErrorBoundary';

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

interface ExploreFiltersProps {
  filters: FilterState;
  showSearchFilters: boolean;
  hasActiveFilters: boolean;
  popularBreeds: string[];
  dogColors: string[];
  coatLengthOptions: string[];
  distanceOptions: string[];
  sizeOptions: string[];
  energyLevels: string[];
  trainingLevels: string[];
  onFiltersUpdate: (newFilters: any) => void;
  onQuickFilterClick: (filter: string) => void;
  onToggleSearchFilters: () => void;
  onResetFilters: () => void;
}

const ExploreFilters = ({
  filters,
  showSearchFilters,
  hasActiveFilters,
  popularBreeds,
  dogColors,
  coatLengthOptions,
  distanceOptions,
  sizeOptions,
  energyLevels,
  trainingLevels,
  onFiltersUpdate,
  onQuickFilterClick,
  onToggleSearchFilters,
  onResetFilters
}: ExploreFiltersProps) => {
  const handleSearchFilterChange = (key: string, value: any) => {
    console.log('SearchFilterChange:', key, value);
    
    const filterMapping: { [key: string]: string } = {
      query: 'searchTerm',
      breed: 'breed',
      minPrice: 'minPrice',
      maxPrice: 'maxPrice',
      userType: 'sourceType',
      verified: 'verifiedOnly',
    };
    
    const filterKey = filterMapping[key] || key;
    onFiltersUpdate({ [filterKey]: value });
  };

  const searchFilters = {
    query: filters.searchTerm || '',
    breed: filters.breed !== 'all' ? filters.breed : undefined,
    minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
    minAge: undefined,
    maxAge: undefined,
    location: undefined,
    userType: filters.sourceType !== 'all' ? filters.sourceType as 'breeder' | 'shelter' : undefined,
    verified: filters.verifiedOnly || undefined,
  };

  const renderSearchFilters = () => {
    try {
      return (
        <SearchFiltersCard
          showFilters={showSearchFilters}
          filters={searchFilters}
          onFilterChange={handleSearchFilterChange}
          onClearFilters={onResetFilters}
          onToggleFilters={onToggleSearchFilters}
        />
      );
    } catch (error) {
      console.error('Error rendering SearchFiltersCard:', error);
      return null;
    }
  };

  return (
    <>
      {/* Quick Filters */}
      <Card className="mb-6 border-blue-200 shadow-sm bg-white">
        <CardContent className="p-4">
          <QuickFiltersBar 
            quickFilters={['Puppies', 'Verified', 'Nearby', 'Available']}
            filters={filters}
            onQuickFilterClick={onQuickFilterClick}
          />
        </CardContent>
      </Card>

      {/* Active filters indicator */}
      {hasActiveFilters && (
        <div className="mb-4">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
            Filters applied
          </Badge>
        </div>
      )}

      {/* Advanced Search Filters */}
      {renderSearchFilters()}

      {/* Popular Breeds Sidebar */}
      <div className="mt-6">
        <ErrorBoundary fallback={<div className="text-sm text-blue-600">Error loading breeds</div>}>
          <Card className="border-blue-200 shadow-sm bg-white">
            <CardContent className="p-4">
              <PopularBreeds 
                popularBreeds={popularBreeds}
                selectedBreed={filters.breed}
                onBreedSelect={(breed) => onFiltersUpdate({ breed })} 
              />
            </CardContent>
          </Card>
        </ErrorBoundary>
      </div>

      {/* Advanced Filters Panel */}
      <ErrorBoundary fallback={<div className="text-sm text-blue-600">Error loading filters panel</div>}>
        <AdvancedFiltersPanel
          filters={filters}
          popularBreeds={popularBreeds}
          dogColors={dogColors}
          coatLengthOptions={coatLengthOptions}
          distanceOptions={distanceOptions}
          sizeOptions={sizeOptions}
          energyLevels={energyLevels}
          trainingLevels={trainingLevels}
          onFilterUpdate={onFiltersUpdate}
          onClearAllFilters={onResetFilters}
        />
      </ErrorBoundary>
    </>
  );
};

export default ExploreFilters;
