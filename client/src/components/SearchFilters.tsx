
import React, { useState } from 'react';
import { Filter, X, MapPin, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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

interface SearchFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  resultsCount: number;
  onClearFilters: () => void;
}

const SearchFilters = ({ filters, onFiltersChange, resultsCount, onClearFilters }: SearchFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = (key: keyof FilterState, value: string | boolean) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const breeds = [
    "All Breeds", "French Bulldog", "Golden Retriever", "German Shepherd", 
    "Labrador", "Beagle", "Pit Bull Mix", "Poodle", "Bulldog", "Rottweiler"
  ];

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'searchTerm') return false; // Don't count search term
    if (typeof value === 'boolean') return value;
    return value !== '' && value !== 'all';
  }).length;

  return (
    <div className="space-y-4">
      {/* Search Bar with Filter Button */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            placeholder="Search by breed, breeder name, or keywords..."
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            className="bg-white border-gray-200"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="ml-1 bg-blue-600 text-white text-xs min-w-[20px] h-5">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Single Filter Panel */}
      {showFilters && (
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Popular Breeds */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Breeds</h4>
              <div className="flex flex-wrap gap-2">
                {breeds.slice(0, 6).map((breed) => (
                  <Badge 
                    key={breed}
                    variant={filters.breed === breed.toLowerCase() ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => updateFilter('breed', breed.toLowerCase())}
                  >
                    {breed}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Source</label>
                <Select value={filters.sourceType} onValueChange={(value) => updateFilter('sourceType', value)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="breeder">Breeders</SelectItem>
                    <SelectItem value="shelter">Shelters</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Age Group</label>
                <Select value={filters.ageGroup} onValueChange={(value) => updateFilter('ageGroup', value)}>
                  <SelectTrigger className="bg-white">
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
                <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                  <DollarSign size={14} />
                  Min Price
                </label>
                <Input
                  placeholder="$0"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="bg-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                  <DollarSign size={14} />
                  Max Price
                </label>
                <Input
                  placeholder="$10,000"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly}
                  onChange={(e) => updateFilter('verifiedOnly', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Verified only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.availableOnly}
                  onChange={(e) => updateFilter('availableOnly', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Available now</span>
              </label>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {resultsCount} puppies found
              </div>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={14} className="mr-1" />
                  Clear all filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchFilters;
