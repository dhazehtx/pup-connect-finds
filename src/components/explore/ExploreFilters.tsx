
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, X } from 'lucide-react';

interface ExploreFiltersProps {
  filters: any;
  showAdvancedFilters: boolean;
  hasActiveFilters: boolean;
  popularBreeds: string[];
  onFiltersUpdate: (filters: any) => void;
  onToggleAdvancedFilters: () => void;
  onResetFilters: () => void;
}

const ExploreFilters = ({
  filters,
  showAdvancedFilters,
  hasActiveFilters,
  popularBreeds,
  onFiltersUpdate,
  onToggleAdvancedFilters,
  onResetFilters
}: ExploreFiltersProps) => {
  const dogColors = ['Black', 'Brown', 'White', 'Golden', 'Cream', 'Red', 'Blue', 'Merle', 'Brindle', 'Sable'];
  const coatLengthOptions = ['Short', 'Medium', 'Long', 'Wire'];
  const distanceOptions = ['5', '10', '25', '50', '100'];
  const sizeOptions = ['Small (Under 25 lbs)', 'Medium (25-60 lbs)', 'Large (60-100 lbs)', 'Giant (Over 100 lbs)'];
  const energyLevels = ['Low', 'Moderate', 'High', 'Very High'];
  const trainingLevels = ['Beginner Friendly', 'Moderate', 'Advanced', 'Expert'];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* Basic Filters Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
            </div>
            Filters
          </h2>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onResetFilters}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Basic Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Location Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Enter city or zip code"
              value={filters.location || ''}
              onChange={(e) => onFiltersUpdate({ location: e.target.value })}
              className="pl-10 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
            />
          </div>

          {/* Breed Selection */}
          <Select value={filters.breed || 'all'} onValueChange={(value) => onFiltersUpdate({ breed: value })}>
            <SelectTrigger className="border-gray-300 focus:border-blue-600 focus:ring-blue-600">
              <SelectValue placeholder="Select breed" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Breeds</SelectItem>
              {popularBreeds.map((breed) => (
                <SelectItem key={breed} value={breed.toLowerCase()}>{breed}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price Range Display */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">
              ${filters.priceRange?.[0] || 0} - ${filters.priceRange?.[1] || 5000}
            </span>
          </div>

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            onClick={onToggleAdvancedFilters}
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            {showAdvancedFilters ? 'Hide' : 'Show'} Advanced
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="p-6 space-y-6 bg-gray-50">
          {/* Price Range Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Price Range: ${filters.priceRange?.[0] || 0} - ${filters.priceRange?.[1] || 5000}
            </label>
            <Slider
              value={filters.priceRange || [0, 5000]}
              onValueChange={(value) => onFiltersUpdate({ priceRange: value })}
              max={5000}
              min={0}
              step={100}
              className="w-full"
            />
          </div>

          {/* Age Range Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Age (months)</label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minAge || ''}
                onChange={(e) => onFiltersUpdate({ minAge: e.target.value })}
                className="border-gray-300 focus:border-blue-600 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Age (months)</label>
              <Input
                type="number"
                placeholder="24"
                value={filters.maxAge || ''}
                onChange={(e) => onFiltersUpdate({ maxAge: e.target.value })}
                className="border-gray-300 focus:border-blue-600 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Advanced Select Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
              <Select value={filters.ageGroup || 'all'} onValueChange={(value) => onFiltersUpdate({ ageGroup: value })}>
                <SelectTrigger className="border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="puppy">Puppies (0-1 year)</SelectItem>
                  <SelectItem value="young">Young (1-3 years)</SelectItem>
                  <SelectItem value="adult">Adult (3+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <Select value={filters.size || 'all'} onValueChange={(value) => onFiltersUpdate({ size: value })}>
                <SelectTrigger className="border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Size</SelectItem>
                  {sizeOptions.map((size) => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <Select value={filters.gender || 'all'} onValueChange={(value) => onFiltersUpdate({ gender: value })}>
                <SelectTrigger className="border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* More Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <Select value={filters.color || 'all'} onValueChange={(value) => onFiltersUpdate({ color: value })}>
                <SelectTrigger className="border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colors</SelectItem>
                  {dogColors.map((color) => (
                    <SelectItem key={color} value={color.toLowerCase()}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distance</label>
              <Select value={filters.maxDistance || 'all'} onValueChange={(value) => onFiltersUpdate({ maxDistance: value })}>
                <SelectTrigger className="border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Distance</SelectItem>
                  {distanceOptions.map((distance) => (
                    <SelectItem key={distance} value={distance}>{distance} miles</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source Type</label>
              <Select value={filters.sourceType || 'all'} onValueChange={(value) => onFiltersUpdate({ sourceType: value })}>
                <SelectTrigger className="border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="breeder">Breeders</SelectItem>
                  <SelectItem value="shelter">Shelters</SelectItem>
                  <SelectItem value="rescue">Rescues</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verifiedOnly || false}
                onChange={(e) => onFiltersUpdate({ verifiedOnly: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-gray-700">Verified Only</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.availableOnly || false}
                onChange={(e) => onFiltersUpdate({ availableOnly: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-gray-700">Available Now</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.healthChecked || false}
                onChange={(e) => onFiltersUpdate({ healthChecked: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-gray-700">Health Checked</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.vaccinated || false}
                onChange={(e) => onFiltersUpdate({ vaccinated: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-gray-700">Vaccinated</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreFilters;
