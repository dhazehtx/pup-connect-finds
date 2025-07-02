
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

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
  coatType: string;
  energyLevel: string;
  size: string;
  priceRange: number[];
}

interface ExploreFiltersProps {
  filters: FilterState;
  showAdvancedFilters: boolean;
  hasActiveFilters: boolean;
  popularBreeds: string[];
  onFiltersUpdate: (newFilters: any) => void;
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
  return (
    <div className="space-y-4">
      {/* Main Filters Row */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Breed</label>
              <Select value={filters.breed} onValueChange={(value) => onFiltersUpdate({ breed: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Breeds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Breeds</SelectItem>
                  {popularBreeds.map((breed) => (
                    <SelectItem key={breed} value={breed.toLowerCase()}>{breed}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Source</label>
              <Select value={filters.sourceType} onValueChange={(value) => onFiltersUpdate({ sourceType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="breeder">Breeder</SelectItem>
                  <SelectItem value="shelter">Shelter/Rescue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Gender</label>
              <Select value={filters.gender} onValueChange={(value) => onFiltersUpdate({ gender: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Distance</label>
              <Select value={filters.maxDistance} onValueChange={(value) => onFiltersUpdate({ maxDistance: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Distance</SelectItem>
                  <SelectItem value="10">Within 10 miles</SelectItem>
                  <SelectItem value="25">Within 25 miles</SelectItem>
                  <SelectItem value="50">Within 50 miles</SelectItem>
                  <SelectItem value="100">Within 100 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={filters.verifiedOnly}
                  onCheckedChange={(checked) => onFiltersUpdate({ verifiedOnly: checked })}
                />
                <span className="text-sm text-gray-700">Verified Only</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={filters.availableOnly}
                  onCheckedChange={(checked) => onFiltersUpdate({ availableOnly: checked })}
                />
                <span className="text-sm text-gray-700">Available Only</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={onResetFilters} className="text-blue-600">
                  Clear All
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onToggleAdvancedFilters}>
                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Price Range */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
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

            {/* Additional Filter Options */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Age Group</label>
                <Select value={filters.ageGroup} onValueChange={(value) => onFiltersUpdate({ ageGroup: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Ages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="puppy">Puppy (0-1 year)</SelectItem>
                    <SelectItem value="young">Young (1-3 years)</SelectItem>
                    <SelectItem value="adult">Adult (3+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Size</label>
                <Select value={filters.size} onValueChange={(value) => onFiltersUpdate({ size: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Size</SelectItem>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="xlarge">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Coat Type</label>
                <Select value={filters.coatType} onValueChange={(value) => onFiltersUpdate({ coatType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Coat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Coat</SelectItem>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Energy Level</label>
                <Select value={filters.energyLevel} onValueChange={(value) => onFiltersUpdate({ energyLevel: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Level</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Input Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Min Price</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => onFiltersUpdate({ minPrice: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Max Price</label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={filters.maxPrice}
                  onChange={(e) => onFiltersUpdate({ maxPrice: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExploreFilters;
