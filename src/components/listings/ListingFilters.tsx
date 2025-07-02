
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';

interface FilterState {
  breed: string;
  priceRange: [number, number];
  age: string;
  location: string;
  size: string;
}

interface ListingFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const ListingFilters = ({ onFiltersChange, isOpen, onToggle }: ListingFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    breed: '',
    priceRange: [0, 5000],
    age: '',
    location: '',
    size: ''
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const breeds = [
    'Golden Retriever', 'Labrador Retriever', 'German Shepherd', 'French Bulldog',
    'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund'
  ];

  const sizes = ['Small', 'Medium', 'Large', 'Extra Large'];
  const ages = ['8-12 weeks', '3-6 months', '6-12 months', '1+ years'];

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update active filters
    const active = Object.entries(newFilters)
      .filter(([k, v]) => {
        if (k === 'priceRange') return v[0] > 0 || v[1] < 5000;
        return v !== '' && v !== null;
      })
      .map(([k]) => k);
    
    setActiveFilters(active);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      breed: '',
      priceRange: [0, 5000] as [number, number],
      age: '',
      location: '',
      size: ''
    };
    setFilters(clearedFilters);
    setActiveFilters([]);
    onFiltersChange(clearedFilters);
  };

  if (!isOpen) {
    return (
      <div className="mb-4">
        <Button
          onClick={onToggle}
          variant="outline"
          className="w-full justify-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Show Filters
          {activeFilters.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilters.length}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
          <div className="flex gap-2">
            {activeFilters.length > 0 && (
              <Button onClick={clearFilters} variant="ghost" size="sm">
                Clear All
              </Button>
            )}
            <Button onClick={onToggle} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Search */}
        <div>
          <label className="text-sm font-medium mb-2 block">Location</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Enter city or zip code"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Breed Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Breed</label>
          <Select value={filters.breed} onValueChange={(value) => handleFilterChange('breed', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select breed" />
            </SelectTrigger>
            <SelectContent>
              {breeds.map((breed) => (
                <SelectItem key={breed} value={breed}>
                  {breed}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
          </label>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => handleFilterChange('priceRange', value as [number, number])}
            max={5000}
            min={0}
            step={100}
            className="w-full"
          />
        </div>

        {/* Age Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Age</label>
          <Select value={filters.age} onValueChange={(value) => handleFilterChange('age', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select age range" />
            </SelectTrigger>
            <SelectContent>
              {ages.map((age) => (
                <SelectItem key={age} value={age}>
                  {age}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Size Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Size</label>
          <Select value={filters.size} onValueChange={(value) => handleFilterChange('size', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingFilters;
