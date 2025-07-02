
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
  color: string;
  trainingLevel: string;
  paperwork: string;
  minAge: string;
  maxAge: string;
  location: string;
  healthChecked: boolean;
  vaccinated: boolean;
  spayedNeutered: boolean;
  goodWithKids: boolean;
  goodWithPets: boolean;
  sortBy: string;
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
  const dogColors = ['Black', 'Brown', 'White', 'Golden', 'Cream', 'Gray', 'Brindle', 'Merle', 'Tri-color'];
  const coatLengthOptions = ['Short', 'Medium', 'Long', 'Wire-haired'];
  const sizeOptions = ['Small', 'Medium', 'Large', 'Extra Large'];
  const energyLevels = ['Low', 'Medium', 'High'];
  const trainingLevels = ['None', 'Basic', 'Intermediate', 'Advanced'];
  const distanceOptions = ['10', '25', '50', '100'];

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
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Advanced Filters</CardTitle>
              <Button variant="outline" size="sm" onClick={onResetFilters}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sort By */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Sort By</label>
              <Select value={filters.sortBy || 'newest'} onValueChange={(value) => onFiltersUpdate({ sortBy: value })}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="age-young">Age: Youngest First</SelectItem>
                  <SelectItem value="age-old">Age: Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Options Row */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
                    <SelectItem value="breeder">Breeders</SelectItem>
                    <SelectItem value="shelter">Shelters</SelectItem>
                    <SelectItem value="rescue">Rescue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Age Group</label>
                <Select value={filters.ageGroup} onValueChange={(value) => onFiltersUpdate({ ageGroup: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Ages" />
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
                <label className="text-sm font-medium text-gray-700 mb-1 block">Color</label>
                <Select value={filters.color || 'all'} onValueChange={(value) => onFiltersUpdate({ color: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Colors" />
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
                <label className="text-sm font-medium text-gray-700 mb-1 block">Coat Length</label>
                <Select value={filters.coatType} onValueChange={(value) => onFiltersUpdate({ coatType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Coat Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Coat Types</SelectItem>
                    {coatLengthOptions.map((coat) => (
                      <SelectItem key={coat} value={coat.toLowerCase()}>{coat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Price Range: ${filters.priceRange?.[0] || 0} - ${filters.priceRange?.[1] || 10000}
              </label>
              <Slider
                value={filters.priceRange || [0, 10000]}
                onValueChange={(value) => onFiltersUpdate({ priceRange: value })}
                max={10000}
                min={0}
                step={100}
                className="w-full"
              />
            </div>

            {/* Age and Location Row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Min Age (weeks)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minAge || ''}
                  onChange={(e) => onFiltersUpdate({ minAge: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Max Age (weeks)</label>
                <Input
                  type="number"
                  placeholder="104"
                  value={filters.maxAge || ''}
                  onChange={(e) => onFiltersUpdate({ maxAge: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
                <Input
                  placeholder="City, State"
                  value={filters.location || ''}
                  onChange={(e) => onFiltersUpdate({ location: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Distance</label>
                <Select value={filters.maxDistance} onValueChange={(value) => onFiltersUpdate({ maxDistance: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any distance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any distance</SelectItem>
                    {distanceOptions.map((distance) => (
                      <SelectItem key={distance} value={distance}>{distance} miles</SelectItem>
                    ))}
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
                    {sizeOptions.map((size) => (
                      <SelectItem key={size} value={size.toLowerCase()}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Training Level</label>
                <Select value={filters.trainingLevel || 'all'} onValueChange={(value) => onFiltersUpdate({ trainingLevel: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Level</SelectItem>
                    {trainingLevels.map((level) => (
                      <SelectItem key={level} value={level.toLowerCase()}>{level}</SelectItem>
                    ))}
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
                    {energyLevels.map((level) => (
                      <SelectItem key={level} value={level.toLowerCase()}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Paperwork</label>
                <Select value={filters.paperwork || 'all'} onValueChange={(value) => onFiltersUpdate({ paperwork: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="akc">AKC Registered</SelectItem>
                    <SelectItem value="champion">Champion Bloodline</SelectItem>
                    <SelectItem value="health">Health Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly}
                  onChange={(e) => onFiltersUpdate({ verifiedOnly: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Verified only</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.availableOnly}
                  onChange={(e) => onFiltersUpdate({ availableOnly: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Available now</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.healthChecked || false}
                  onChange={(e) => onFiltersUpdate({ healthChecked: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Health checked</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.vaccinated || false}
                  onChange={(e) => onFiltersUpdate({ vaccinated: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Vaccinated</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.spayedNeutered || false}
                  onChange={(e) => onFiltersUpdate({ spayedNeutered: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Spayed/Neutered</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.goodWithKids || false}
                  onChange={(e) => onFiltersUpdate({ goodWithKids: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Good with kids</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.goodWithPets || false}
                  onChange={(e) => onFiltersUpdate({ goodWithPets: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Good with pets</span>
              </label>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExploreFilters;
