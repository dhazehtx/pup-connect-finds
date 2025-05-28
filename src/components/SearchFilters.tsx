
import React, { useState } from 'react';
import { Search, Filter, X, MapPin, DollarSign, Calendar, Heart } from 'lucide-react';
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
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof FilterState, value: string | boolean) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const breeds = [
    "All Breeds", "French Bulldog", "Golden Retriever", "German Shepherd", 
    "Labrador", "Beagle", "Pit Bull Mix", "Poodle", "Bulldog", "Rottweiler"
  ];

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'searchTerm') return value.length > 0;
    if (typeof value === 'boolean') return value;
    return value !== '' && value !== 'all';
  }).length;

  return (
    <Card className="bg-white border border-gray-200 mb-6">
      <CardContent className="p-4 space-y-4">
        {/* Main Search Bar */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search for puppies, breeds, or locations..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="pl-10 bg-white border-gray-200 text-black placeholder:text-black"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
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

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Breed</label>
                <Select value={filters.breed} onValueChange={(value) => updateFilter('breed', value)}>
                  <SelectTrigger className="bg-white border-gray-200 text-black">
                    <SelectValue placeholder="All Breeds" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {breeds.map((breed) => (
                      <SelectItem key={breed} value={breed.toLowerCase()} className="text-black">{breed}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Source</label>
                <Select value={filters.sourceType} onValueChange={(value) => updateFilter('sourceType', value)}>
                  <SelectTrigger className="bg-white border-gray-200 text-black">
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="all" className="text-black">All Sources</SelectItem>
                    <SelectItem value="breeder" className="text-black">Breeders</SelectItem>
                    <SelectItem value="shelter" className="text-black">Shelters</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Age Group</label>
                <Select value={filters.ageGroup} onValueChange={(value) => updateFilter('ageGroup', value)}>
                  <SelectTrigger className="bg-white border-gray-200 text-black">
                    <SelectValue placeholder="All Ages" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="all" className="text-black">All Ages</SelectItem>
                    <SelectItem value="puppy" className="text-black">Puppy (0-1 year)</SelectItem>
                    <SelectItem value="young" className="text-black">Young (1-3 years)</SelectItem>
                    <SelectItem value="adult" className="text-black">Adult (3+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Gender</label>
                <Select value={filters.gender} onValueChange={(value) => updateFilter('gender', value)}>
                  <SelectTrigger className="bg-white border-gray-200 text-black">
                    <SelectValue placeholder="All Genders" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="all" className="text-black">All Genders</SelectItem>
                    <SelectItem value="male" className="text-black">Male</SelectItem>
                    <SelectItem value="female" className="text-black">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                  <DollarSign size={14} />
                  Min Price
                </label>
                <Input
                  placeholder="$0"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="bg-white border-gray-200 text-black placeholder:text-black"
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
                  className="bg-white border-gray-200 text-black placeholder:text-black"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                  <MapPin size={14} />
                  Max Distance
                </label>
                <Select value={filters.maxDistance} onValueChange={(value) => updateFilter('maxDistance', value)}>
                  <SelectTrigger className="bg-white border-gray-200 text-black">
                    <SelectValue placeholder="Any distance" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="all" className="text-black">Any distance</SelectItem>
                    <SelectItem value="5" className="text-black">Within 5 miles</SelectItem>
                    <SelectItem value="10" className="text-black">Within 10 miles</SelectItem>
                    <SelectItem value="25" className="text-black">Within 25 miles</SelectItem>
                    <SelectItem value="50" className="text-black">Within 50 miles</SelectItem>
                    <SelectItem value="100" className="text-black">Within 100 miles</SelectItem>
                  </SelectContent>
                </Select>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchFilters;
