
import React from 'react';
import { X, MapPin, DollarSign, Calendar, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface SearchFilters {
  breeds: string[];
  priceRange: [number, number];
  ageRange: [number, number];
  location: string;
  radius: number;
  verifiedOnly: boolean;
  availableOnly: boolean;
  sortBy: string;
}

interface SearchFiltersPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  onClose: () => void;
}

const popularBreeds = [
  'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'French Bulldog',
  'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Siberian Husky', 'Dachshund'
];

const SearchFiltersPanel = ({ filters, onFiltersChange, onClose }: SearchFiltersPanelProps) => {
  const handleBreedToggle = (breed: string) => {
    const newBreeds = filters.breeds.includes(breed)
      ? filters.breeds.filter(b => b !== breed)
      : [...filters.breeds, breed];
    onFiltersChange({ breeds: newBreeds });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Advanced Filters
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Breed Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Breeds</Label>
          <div className="flex flex-wrap gap-2">
            {popularBreeds.map(breed => (
              <Badge
                key={breed}
                variant={filters.breeds.includes(breed) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => handleBreedToggle(breed)}
              >
                {breed}
              </Badge>
            ))}
          </div>
          {filters.breeds.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Selected: {filters.breeds.join(', ')}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFiltersChange({ breeds: [] })}
              >
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4" />
            Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
          </Label>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => onFiltersChange({ priceRange: value as [number, number] })}
            max={10000}
            min={0}
            step={100}
            className="w-full"
          />
          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="text-xs">Min Price</Label>
              <Input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) => onFiltersChange({ 
                  priceRange: [parseInt(e.target.value) || 0, filters.priceRange[1]] 
                })}
                className="h-8"
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs">Max Price</Label>
              <Input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) => onFiltersChange({ 
                  priceRange: [filters.priceRange[0], parseInt(e.target.value) || 10000] 
                })}
                className="h-8"
              />
            </div>
          </div>
        </div>

        {/* Age Range */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            Age Range: {Math.floor(filters.ageRange[0] / 4)} - {Math.floor(filters.ageRange[1] / 4)} months
          </Label>
          <Slider
            value={filters.ageRange}
            onValueChange={(value) => onFiltersChange({ ageRange: value as [number, number] })}
            max={156}
            min={0}
            step={4}
            className="w-full"
          />
        </div>

        {/* Location and Radius */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4" />
            Location & Distance
          </Label>
          <Input
            placeholder="Enter city, state, or ZIP code"
            value={filters.location}
            onChange={(e) => onFiltersChange({ location: e.target.value })}
          />
          <div className="space-y-2">
            <Label className="text-xs">Search Radius: {filters.radius} miles</Label>
            <Slider
              value={[filters.radius]}
              onValueChange={(value) => onFiltersChange({ radius: value[0] })}
              max={200}
              min={5}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Filters</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="verified" className="text-sm">Verified sellers only</Label>
              <Switch
                id="verified"
                checked={filters.verifiedOnly}
                onCheckedChange={(checked) => onFiltersChange({ verifiedOnly: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="available" className="text-sm">Available now</Label>
              <Switch
                id="available"
                checked={filters.availableOnly}
                onCheckedChange={(checked) => onFiltersChange({ availableOnly: checked })}
              />
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Sort Results</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => onFiltersChange({ sortBy: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Best Match</SelectItem>
              <SelectItem value="price">Price: Low to High</SelectItem>
              <SelectItem value="age">Age: Youngest First</SelectItem>
              <SelectItem value="distance">Distance: Nearest First</SelectItem>
              <SelectItem value="newest">Recently Listed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear All Filters */}
        <Button
          variant="outline"
          onClick={() => onFiltersChange({
            breeds: [],
            priceRange: [0, 5000],
            ageRange: [0, 156],
            location: '',
            radius: 50,
            verifiedOnly: false,
            availableOnly: true,
            sortBy: 'relevance'
          })}
          className="w-full"
        >
          Clear All Filters
        </Button>
      </CardContent>
    </Card>
  );
};

export default SearchFiltersPanel;
