
import React, { useState } from 'react';
import { Search, Filter, MapPin, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface SearchFilters {
  query: string;
  breed: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  minAge: number;
  maxAge: number;
}

interface EnhancedSearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  loading?: boolean;
}

const EnhancedSearchBar = ({ onSearch, loading }: EnhancedSearchBarProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    breed: '',
    location: '',
    minPrice: 0,
    maxPrice: 5000,
    minAge: 0,
    maxAge: 15,
  });

  const popularBreeds = [
    'All Breeds',
    'Labrador Retriever',
    'Golden Retriever', 
    'German Shepherd',
    'Bulldog',
    'Poodle',
    'Beagle',
    'Rottweiler',
    'Yorkshire Terrier',
    'Dachshund',
    'Siberian Husky',
    'Great Dane',
    'Chihuahua',
    'Border Collie',
    'Boxer'
  ];

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      breed: '',
      location: '',
      minPrice: 0,
      maxPrice: 5000,
      minAge: 0,
      maxAge: 15,
    });
    onSearch({
      query: '',
      breed: '',
      location: '',
      minPrice: 0,
      maxPrice: 5000,
      minAge: 0,
      maxAge: 15,
    });
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by dog name, breed, or description..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="pl-10"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={filters.breed} onValueChange={(value) => handleFilterChange('breed', value === 'All Breeds' ? '' : value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select breed" />
          </SelectTrigger>
          <SelectContent>
            {popularBreeds.map((breed) => (
              <SelectItem key={breed} value={breed}>
                {breed}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Location"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="pl-10 w-48"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Price Range
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div>
                <Label>Price Range: ${filters.minPrice} - ${filters.maxPrice}</Label>
                <Slider
                  value={[filters.minPrice, filters.maxPrice]}
                  onValueChange={([min, max]) => {
                    handleFilterChange('minPrice', min);
                    handleFilterChange('maxPrice', max);
                  }}
                  max={5000}
                  min={0}
                  step={100}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Age Range: {filters.minAge} - {filters.maxAge} years</Label>
                <Slider
                  value={[filters.minAge, filters.maxAge]}
                  onValueChange={([min, max]) => {
                    handleFilterChange('minAge', min);
                    handleFilterChange('maxAge', max);
                  }}
                  max={15}
                  min={0}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-4">
              <Button 
                onClick={clearFilters}
                variant="outline" 
                className="w-full"
              >
                Clear All Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {(filters.breed || filters.location || filters.minPrice > 0 || filters.maxPrice < 5000 || filters.minAge > 0 || filters.maxAge < 15) && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.breed && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              {filters.breed}
            </span>
          )}
          {filters.location && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              📍 {filters.location}
            </span>
          )}
          {(filters.minPrice > 0 || filters.maxPrice < 5000) && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              💰 ${filters.minPrice} - ${filters.maxPrice}
            </span>
          )}
          {(filters.minAge > 0 || filters.maxAge < 15) && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              🎂 {filters.minAge} - {filters.maxAge} years
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchBar;
