import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Search, 
  Filter, 
  MapPin, 
  Sort, 
  Star, 
  Clock,
  DollarSign,
  Heart,
  X
} from 'lucide-react';
import LocationFilter from './LocationFilter';

interface SearchFilters {
  query: string;
  breeds: string[];
  priceRange: [number, number];
  ageRange: [number, number];
  location?: any;
  radius: number;
  verified: boolean;
  sortBy: 'distance' | 'price' | 'date' | 'popularity';
  sortOrder: 'asc' | 'desc';
}

interface EnhancedSearchInterfaceProps {
  onSearch: (filters: SearchFilters) => void;
  availableBreeds: string[];
  savedSearches?: any[];
  onSaveSearch?: (filters: SearchFilters, name: string) => void;
}

const EnhancedSearchInterface = ({ 
  onSearch, 
  availableBreeds, 
  savedSearches = [],
  onSaveSearch 
}: EnhancedSearchInterfaceProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    breeds: [],
    priceRange: [0, 5000],
    ageRange: [0, 24],
    radius: 50,
    verified: false,
    sortBy: 'distance',
    sortOrder: 'asc'
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleBreedToggle = (breed: string) => {
    const newBreeds = filters.breeds.includes(breed)
      ? filters.breeds.filter(b => b !== breed)
      : [...filters.breeds, breed];
    handleFilterChange('breeds', newBreeds);
  };

  const handleLocationChange = (location: any, radius: number) => {
    setFilters(prev => ({ ...prev, location, radius }));
    onSearch({ ...filters, location, radius });
  };

  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      query: '',
      breeds: [],
      priceRange: [0, 5000],
      ageRange: [0, 24],
      radius: 50,
      verified: false,
      sortBy: 'distance',
      sortOrder: 'asc'
    };
    setFilters(defaultFilters);
    onSearch(defaultFilters);
  };

  const handleSaveSearch = () => {
    if (searchName.trim() && onSaveSearch) {
      onSaveSearch(filters, searchName);
      setSearchName('');
      setShowSaveDialog(false);
    }
  };

  const sortOptions = [
    { value: 'distance', label: 'Distance', icon: MapPin },
    { value: 'price', label: 'Price', icon: DollarSign },
    { value: 'date', label: 'Date Listed', icon: Clock },
    { value: 'popularity', label: 'Popularity', icon: Star }
  ];

  return (
    <div className="space-y-4">
      {/* Main search bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                placeholder="Search by breed, name, or location..."
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Save
            </Button>
          </div>

          {/* Active filters */}
          {(filters.breeds.length > 0 || filters.verified || filters.location) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {filters.breeds.map(breed => (
                <Badge key={breed} variant="secondary" className="flex items-center gap-1">
                  {breed}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleBreedToggle(breed)}
                  />
                </Badge>
              ))}
              {filters.verified && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Verified only
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleFilterChange('verified', false)}
                  />
                </Badge>
              )}
              {filters.location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {filters.location.address}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleFilterChange('location', null)}
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Location filter */}
          <LocationFilter
            onLocationChange={handleLocationChange}
            selectedLocation={filters.location}
            selectedRadius={filters.radius}
          />

          {/* Other filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                </label>
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => handleFilterChange('priceRange', value)}
                  max={10000}
                  min={0}
                  step={100}
                  className="w-full"
                />
              </div>

              {/* Age range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Age Range: {filters.ageRange[0]} - {filters.ageRange[1]} months
                </label>
                <Slider
                  value={filters.ageRange}
                  onValueChange={(value) => handleFilterChange('ageRange', value)}
                  max={36}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Breeds */}
              <div>
                <label className="text-sm font-medium mb-2 block">Popular Breeds</label>
                <div className="flex flex-wrap gap-2">
                  {availableBreeds.slice(0, 8).map(breed => (
                    <Badge
                      key={breed}
                      variant={filters.breeds.includes(breed) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleBreedToggle(breed)}
                    >
                      {breed}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Verified toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="verified"
                  checked={filters.verified}
                  onChange={(e) => handleFilterChange('verified', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="verified" className="text-sm">
                  Verified breeders only
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sort options */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Sort by:</span>
            <div className="flex gap-2">
              {sortOptions.map(option => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={filters.sortBy === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('sortBy', option.value)}
                    className="flex items-center gap-1"
                  >
                    <Icon className="w-3 h-3" />
                    {option.label}
                    {filters.sortBy === option.value && (
                      <span 
                        className="ml-1 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        {filters.sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved searches */}
      {savedSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Saved Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {savedSearches.map((search, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setFilters(search.filters);
                    onSearch(search.filters);
                  }}
                >
                  {search.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save search dialog */}
      {showSaveDialog && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Name your search..."
                className="flex-1"
              />
              <Button onClick={handleSaveSearch} disabled={!searchName.trim()}>
                Save
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedSearchInterface;
