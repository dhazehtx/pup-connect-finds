
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Filter, Sparkles, MapPin, DollarSign, Calendar, Shield } from 'lucide-react';

interface SmartFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  availableBreeds: string[];
  onSaveAsPreset?: (name: string, filters: any) => void;
}

const SmartFilters = ({ 
  filters, 
  onFiltersChange, 
  availableBreeds,
  onSaveAsPreset 
}: SmartFiltersProps) => {
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.breeds?.length > 0) count++;
    if (filters.priceRange?.[0] > 0 || filters.priceRange?.[1] < 10000) count++;
    if (filters.ageRange?.[0] > 0 || filters.ageRange?.[1] < 24) count++;
    if (filters.location) count++;
    if (filters.verified) count++;
    return count;
  };

  const clearAllFilters = () => {
    onFiltersChange({
      query: filters.query || '',
      breeds: [],
      priceRange: [0, 10000],
      ageRange: [0, 24],
      location: null,
      radius: 50,
      verified: false,
      sortBy: 'relevance'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Smart Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">{getActiveFiltersCount()} active</Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              disabled={getActiveFiltersCount() === 0}
            >
              Clear All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSavePreset(true)}
              disabled={getActiveFiltersCount() === 0}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Save Preset
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Breed Selection */}
        <div>
          <Label className="text-sm font-medium mb-2 flex items-center gap-2">
            <span>Breed Preferences</span>
          </Label>
          <Select
            value={filters.breeds?.[0] || ''}
            onValueChange={(value) => handleFilterChange('breeds', value ? [value] : [])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any breed" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any breed</SelectItem>
              {availableBreeds.slice(0, 20).map((breed) => (
                <SelectItem key={breed} value={breed.toLowerCase()}>
                  {breed}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Price Range: ${filters.priceRange?.[0] || 0} - ${filters.priceRange?.[1] || 10000}
          </Label>
          <Slider
            value={filters.priceRange || [0, 10000]}
            onValueChange={(value) => handleFilterChange('priceRange', value)}
            max={10000}
            min={0}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$0</span>
            <span>$10,000+</span>
          </div>
        </div>

        {/* Age Range */}
        <div>
          <Label className="text-sm font-medium mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Age Range: {filters.ageRange?.[0] || 0} - {filters.ageRange?.[1] || 24} weeks
          </Label>
          <Slider
            value={filters.ageRange || [0, 24]}
            onValueChange={(value) => handleFilterChange('ageRange', value)}
            max={24}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Newborn</span>
            <span>6+ months</span>
          </div>
        </div>

        {/* Distance */}
        <div>
          <Label className="text-sm font-medium mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Search Radius: {filters.radius || 50} miles
          </Label>
          <Slider
            value={[filters.radius || 50]}
            onValueChange={(value) => handleFilterChange('radius', value[0])}
            max={200}
            min={5}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5 miles</span>
            <span>200+ miles</span>
          </div>
        </div>

        {/* Verification Filter */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Verified Sellers Only
          </Label>
          <Switch
            checked={filters.verified || false}
            onCheckedChange={(checked) => handleFilterChange('verified', checked)}
          />
        </div>

        {/* Sort Options */}
        <div>
          <Label className="text-sm font-medium mb-2">Sort By</Label>
          <Select
            value={filters.sortBy || 'relevance'}
            onValueChange={(value) => handleFilterChange('sortBy', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Summary */}
        {getActiveFiltersCount() > 0 && (
          <div className="pt-4 border-t">
            <Label className="text-sm font-medium mb-2">Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {filters.breeds?.length > 0 && (
                <Badge variant="outline">
                  Breed: {filters.breeds[0]}
                  <button
                    onClick={() => handleFilterChange('breeds', [])}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {(filters.priceRange?.[0] > 0 || filters.priceRange?.[1] < 10000) && (
                <Badge variant="outline">
                  Price: ${filters.priceRange[0]}-${filters.priceRange[1]}
                  <button
                    onClick={() => handleFilterChange('priceRange', [0, 10000])}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.verified && (
                <Badge variant="outline">
                  Verified Only
                  <button
                    onClick={() => handleFilterChange('verified', false)}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartFilters;
