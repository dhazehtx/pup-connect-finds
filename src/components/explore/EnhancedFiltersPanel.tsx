
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface FilterState {
  breed: string;
  gender: string;
  size: string;
  color: string;
  minPrice: string;
  maxPrice: string;
  location: string;
  vaccinated: boolean;
  neutered_spayed: boolean;
  good_with_kids: boolean;
  good_with_dogs: boolean;
  delivery_available: boolean;
  rehoming: boolean;
}

interface EnhancedFiltersPanelProps {
  filters: FilterState;
  onFilterUpdate: (key: string, value: any) => void;
  onClearAllFilters: () => void;
  popularBreeds: string[];
}

const EnhancedFiltersPanel = ({ 
  filters, 
  onFilterUpdate, 
  onClearAllFilters, 
  popularBreeds 
}: EnhancedFiltersPanelProps) => {
  return (
    <div className="bg-white p-4 border-b">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Advanced Filters</h3>
          <Button variant="outline" size="sm" onClick={onClearAllFilters}>
            Clear All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Basic Filters */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Breed</Label>
                <Select value={filters.breed} onValueChange={(value) => onFilterUpdate('breed', value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Any breed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any breed</SelectItem>
                    {popularBreeds.map(breed => (
                      <SelectItem key={breed} value={breed}>
                        {breed}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Gender</Label>
                <Select value={filters.gender} onValueChange={(value) => onFilterUpdate('gender', value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Size</Label>
                <Select value={filters.size} onValueChange={(value) => onFilterUpdate('size', value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Any size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any size</SelectItem>
                    <SelectItem value="Small">Small</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Price & Location */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Price & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Min Price</Label>
                  <Input
                    type="number"
                    placeholder="$0"
                    value={filters.minPrice}
                    onChange={(e) => onFilterUpdate('minPrice', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Max Price</Label>
                  <Input
                    type="number"
                    placeholder="No limit"
                    value={filters.maxPrice}
                    onChange={(e) => onFilterUpdate('maxPrice', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Location</Label>
                <Input
                  placeholder="City, State"
                  value={filters.location}
                  onChange={(e) => onFilterUpdate('location', e.target.value)}
                  className="h-8"
                />
              </div>

              <div>
                <Label className="text-xs">Color</Label>
                <Input
                  placeholder="e.g., Black, Brown"
                  value={filters.color}
                  onChange={(e) => onFilterUpdate('color', e.target.value)}
                  className="h-8"
                />
              </div>
            </CardContent>
          </Card>

          {/* Health & Behavior */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Health & Behavior</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vaccinated"
                  checked={filters.vaccinated}
                  onCheckedChange={(checked) => onFilterUpdate('vaccinated', checked)}
                />
                <Label htmlFor="vaccinated" className="text-sm">Vaccinated</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="neutered_spayed"
                  checked={filters.neutered_spayed}
                  onCheckedChange={(checked) => onFilterUpdate('neutered_spayed', checked)}
                />
                <Label htmlFor="neutered_spayed" className="text-sm">Neutered/Spayed</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="good_with_kids"
                  checked={filters.good_with_kids}
                  onCheckedChange={(checked) => onFilterUpdate('good_with_kids', checked)}
                />
                <Label htmlFor="good_with_kids" className="text-sm">Good with Kids</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="good_with_dogs"
                  checked={filters.good_with_dogs}
                  onCheckedChange={(checked) => onFilterUpdate('good_with_dogs', checked)}
                />
                <Label htmlFor="good_with_dogs" className="text-sm">Good with Dogs</Label>
              </div>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Additional Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="delivery_available"
                  checked={filters.delivery_available}
                  onCheckedChange={(checked) => onFilterUpdate('delivery_available', checked)}
                />
                <Label htmlFor="delivery_available" className="text-sm">Delivery Available</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rehoming"
                  checked={filters.rehoming}
                  onCheckedChange={(checked) => onFilterUpdate('rehoming', checked)}
                />
                <Label htmlFor="rehoming" className="text-sm">Rehoming Only</Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedFiltersPanel;
