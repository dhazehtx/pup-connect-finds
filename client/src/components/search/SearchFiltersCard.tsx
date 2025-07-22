
import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SearchFilters {
  query?: string;
  breed?: string;
  minPrice?: number;
  maxPrice?: number;
  minAge?: number;
  maxAge?: number;
  location?: string;
  userType?: 'breeder' | 'shelter';
  verified?: boolean;
}

interface SearchFiltersCardProps {
  showFilters: boolean;
  filters: SearchFilters;
  onFilterChange: (key: keyof SearchFilters, value: any) => void;
  onClearFilters: () => void;
  onToggleFilters: () => void;
}

const SearchFiltersCard = ({ 
  showFilters, 
  filters, 
  onFilterChange, 
  onClearFilters, 
  onToggleFilters 
}: SearchFiltersCardProps) => {
  if (!showFilters) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Advanced Filters
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Breed */}
          <div>
            <Label>Breed</Label>
            <Input
              placeholder="e.g., Golden Retriever"
              value={filters.breed || ''}
              onChange={(e) => onFilterChange('breed', e.target.value)}
            />
          </div>

          {/* Location */}
          <div>
            <Label>Location</Label>
            <Input
              placeholder="City, State"
              value={filters.location || ''}
              onChange={(e) => onFilterChange('location', e.target.value)}
            />
          </div>

          {/* User Type */}
          <div>
            <Label>Seller Type</Label>
            <Select value={filters.userType} onValueChange={(value) => onFilterChange('userType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breeder">Breeder</SelectItem>
                <SelectItem value="shelter">Shelter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label>Price Range: ${filters.minPrice || 0} - ${filters.maxPrice || 10000}</Label>
          <div className="flex gap-4 mt-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice || ''}
                onChange={(e) => onFilterChange('minPrice', parseInt(e.target.value) || undefined)}
              />
            </div>
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice || ''}
                onChange={(e) => onFilterChange('maxPrice', parseInt(e.target.value) || undefined)}
              />
            </div>
          </div>
        </div>

        {/* Age Range */}
        <div>
          <Label>Age Range: {filters.minAge || 0} - {filters.maxAge || 120} months</Label>
          <div className="flex gap-4 mt-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Min Age (months)"
                value={filters.minAge || ''}
                onChange={(e) => onFilterChange('minAge', parseInt(e.target.value) || undefined)}
              />
            </div>
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Max Age (months)"
                value={filters.maxAge || ''}
                onChange={(e) => onFilterChange('maxAge', parseInt(e.target.value) || undefined)}
              />
            </div>
          </div>
        </div>

        {/* Verified Only */}
        <div className="flex items-center space-x-2">
          <Switch
            checked={filters.verified || false}
            onCheckedChange={(checked) => onFilterChange('verified', checked)}
          />
          <Label>Show only verified sellers</Label>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchFiltersCard;
