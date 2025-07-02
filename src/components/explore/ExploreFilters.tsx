
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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

      {/* Active filters indicator with clear all option */}
      {hasActiveFilters && (
        <div className="mb-4 flex items-center justify-between">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
            Filters applied
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onResetFilters}
            className="text-blue-600 hover:text-blue-800"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Advanced Search Filters - Restored */}
      <Card className="mb-6 border-blue-200 shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Advanced Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSearchFilters}
                className="text-blue-600"
              >
                {showSearchFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>

            {showSearchFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Breed Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Breed</label>
                  <select
                    value={filters.breed}
                    onChange={(e) => onFiltersUpdate({ breed: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Breeds</option>
                    {popularBreeds.map((breed) => (
                      <option key={breed} value={breed.toLowerCase()}>{breed}</option>
                    ))}
                  </select>
                </div>

                {/* Age Group Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Age</label>
                  <select
                    value={filters.ageGroup}
                    onChange={(e) => onFiltersUpdate({ ageGroup: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Ages</option>
                    <option value="puppy">Puppy (0-1 year)</option>
                    <option value="young">Young (1-3 years)</option>
                    <option value="adult">Adult (3+ years)</option>
                  </select>
                </div>

                {/* Gender Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Gender</label>
                  <select
                    value={filters.gender}
                    onChange={(e) => onFiltersUpdate({ gender: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                {/* Source Type Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Source</label>
                  <select
                    value={filters.sourceType}
                    onChange={(e) => onFiltersUpdate({ sourceType: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Sources</option>
                    <option value="breeder">Breeder</option>
                    <option value="shelter">Shelter/Rescue</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Min Price</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minPrice}
                    onChange={(e) => onFiltersUpdate({ minPrice: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Max Price</label>
                  <input
                    type="number"
                    placeholder="No limit"
                    value={filters.maxPrice}
                    onChange={(e) => onFiltersUpdate({ maxPrice: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                {/* Distance Filter */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Distance</label>
                  <select
                    value={filters.maxDistance}
                    onChange={(e) => onFiltersUpdate({ maxDistance: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">Any Distance</option>
                    <option value="10">Within 10 miles</option>
                    <option value="25">Within 25 miles</option>
                    <option value="50">Within 50 miles</option>
                    <option value="100">Within 100 miles</option>
                  </select>
                </div>

                {/* Toggle Filters */}
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Verified Sellers Only</span>
                    <Switch
                      checked={filters.verifiedOnly}
                      onCheckedChange={(checked) => onFiltersUpdate({ verifiedOnly: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Available Only</span>
                    <Switch
                      checked={filters.availableOnly}
                      onCheckedChange={(checked) => onFiltersUpdate({ availableOnly: checked })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
