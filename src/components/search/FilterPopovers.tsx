
import React from 'react';
import { Filter, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface FilterPopoversProps {
  filters: SearchFilters;
  onFilterChange: (key: keyof SearchFilters, value: string | number) => void;
  onClearFilters: () => void;
}

const FilterPopovers = ({ filters, onFilterChange, onClearFilters }: FilterPopoversProps) => {
  return (
    <>
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
                  onFilterChange('minPrice', min);
                  onFilterChange('maxPrice', max);
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
                  onFilterChange('minAge', min);
                  onFilterChange('maxAge', max);
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
              onClick={onClearFilters}
              variant="outline" 
              className="w-full"
            >
              Clear All Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default FilterPopovers;
