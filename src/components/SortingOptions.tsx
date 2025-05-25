
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Grid, List } from 'lucide-react';

interface SortingOptionsProps {
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  resultsCount: number;
}

const SortingOptions = ({ sortBy, onSortChange, viewMode, onViewModeChange, resultsCount }: SortingOptionsProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-900">
        {resultsCount} {resultsCount === 1 ? 'puppy' : 'puppies'} available
      </h2>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 border border-gray-200 rounded-md bg-white">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className={`rounded-r-none ${viewMode === 'grid' ? 'bg-royal-blue text-white' : 'text-gray-600'}`}
          >
            <Grid size={16} />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className={`rounded-l-none ${viewMode === 'list' ? 'bg-royal-blue text-white' : 'text-gray-600'}`}
          >
            <List size={16} />
          </Button>
        </div>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-48 bg-white border-gray-200">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="distance">Closest first</SelectItem>
            <SelectItem value="rating">Highest rated</SelectItem>
            <SelectItem value="age-young">Youngest first</SelectItem>
            <SelectItem value="age-old">Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SortingOptions;
