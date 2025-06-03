
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Sparkles, MapPin, Heart } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchFilters {
  query: string;
  breed: string;
  priceRange: [number, number];
  ageRange: [number, number];
  location: string;
  distance: number;
}

interface EnhancedSearchInterfaceProps {
  onSearch: (filters: SearchFilters) => void;
  onAISearch?: (query: string) => void;
  suggestions?: string[];
  loading?: boolean;
}

const EnhancedSearchInterface = ({ 
  onSearch, 
  onAISearch, 
  suggestions = [],
  loading = false 
}: EnhancedSearchInterfaceProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    breed: '',
    priceRange: [0, 5000],
    ageRange: [0, 10],
    location: '',
    distance: 50
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aiMode, setAiMode] = useState(false);

  const debouncedSearch = useDebounce((searchFilters: SearchFilters) => {
    onSearch(searchFilters);
  }, 500);

  const handleFilterChange = useCallback((key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    debouncedSearch(newFilters);
  }, [filters, debouncedSearch]);

  const handleAISearch = () => {
    if (onAISearch && filters.query) {
      onAISearch(filters.query);
    }
  };

  const popularBreeds = [
    'Golden Retriever', 'Labrador', 'German Shepherd', 'Bulldog',
    'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier'
  ];

  const quickFilters = [
    { label: 'Puppies', filters: { ageRange: [0, 1] } },
    { label: 'Small Dogs', filters: { breed: 'small' } },
    { label: 'Large Dogs', filters: { breed: 'large' } },
    { label: 'Under $1000', filters: { priceRange: [0, 1000] } },
  ];

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={aiMode ? "Describe your perfect dog..." : "Search for dogs..."}
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button
              variant={aiMode ? "default" : "outline"}
              onClick={() => setAiMode(!aiMode)}
              size="icon"
            >
              <Sparkles className="h-4 w-4" />
            </Button>

            {aiMode && (
              <Button onClick={handleAISearch} disabled={loading || !filters.query}>
                AI Search
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              size="icon"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-3">
            {quickFilters.map((filter, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-blue-100"
                onClick={() => {
                  Object.entries(filter.filters).forEach(([key, value]) => {
                    handleFilterChange(key as keyof SearchFilters, value);
                  });
                }}
              >
                {filter.label}
              </Badge>
            ))}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-3">
              <Label className="text-xs text-gray-500">Suggestions:</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer text-xs"
                    onClick={() => handleFilterChange('query', suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Breed Selection */}
            <div className="space-y-2">
              <Label>Breed</Label>
              <Select 
                value={filters.breed} 
                onValueChange={(value) => handleFilterChange('breed', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a breed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any breed</SelectItem>
                  {popularBreeds.map(breed => (
                    <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label>Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}</Label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => handleFilterChange('priceRange', value)}
                max={5000}
                min={0}
                step={100}
                className="w-full"
              />
            </div>

            {/* Age Range */}
            <div className="space-y-2">
              <Label>Age Range: {filters.ageRange[0]} - {filters.ageRange[1]} years</Label>
              <Slider
                value={filters.ageRange}
                onValueChange={(value) => handleFilterChange('ageRange', value)}
                max={15}
                min={0}
                step={1}
                className="w-full"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter city or zip code"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Distance */}
            <div className="space-y-2">
              <Label>Distance: {filters.distance} miles</Label>
              <Slider
                value={[filters.distance]}
                onValueChange={(value) => handleFilterChange('distance', value[0])}
                max={500}
                min={5}
                step={5}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedSearchInterface;
