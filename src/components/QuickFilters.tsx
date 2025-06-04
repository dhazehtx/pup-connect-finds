
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [showFilters, setShowFilters] = useState(false);
  
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

  const updateFilter = (key: keyof FilterState, value: string | boolean) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'searchTerm') return value.length > 0;
    if (typeof value === 'boolean') return value;
    return value !== '' && value !== 'all';
  }).length;

  return (
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
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Popular Breeds */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Popular Breeds</h3>
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={filters.breed === 'all' ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleBreedClick('all')}
          >
            All Breeds
          </Badge>
          {popularBreeds.map((breed) => (
            <Badge 
              key={breed}
              variant={filters.breed === breed.toLowerCase() ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleBreedClick(breed)}
            >
              {breed}
            </Badge>
          ))}
        </div>
      </div>

      {/* Quick Filters */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Quick Filters</h3>
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((item) => (
            <Badge
              key={item.label}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleQuickFilterClick(item.filter)}
            >
              {item.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Single Filter Panel */}
      {showFilters && (
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Advanced Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="w-4 h-4" />
              </Button>
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
                <label className="text-sm font-medium text-gray-700 mb-1 block">Min Price</label>
                <Input
                  placeholder="$0"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="bg-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Max Price</label>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear all filters
              </Button>
              <Button
                size="sm"
                onClick={() => setShowFilters(false)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuickFilters;
