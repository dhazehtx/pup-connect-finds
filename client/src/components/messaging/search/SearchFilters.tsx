
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter } from 'lucide-react';

interface SearchFilters {
  messageTypes: string[];
  dateRange: {
    start: string;
    end: string;
  };
  sender: string;
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchFilters = ({ filters, onFiltersChange, isOpen, onOpenChange }: SearchFiltersProps) => {
  const toggleMessageType = (type: string) => {
    const newTypes = filters.messageTypes.includes(type)
      ? filters.messageTypes.filter(t => t !== type)
      : [...filters.messageTypes, type];
    
    onFiltersChange({
      ...filters,
      messageTypes: newTypes
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      messageTypes: [],
      dateRange: { start: '', end: '' },
      sender: 'all'
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.messageTypes.length > 0) count++;
    if (filters.dateRange.start) count++;
    if (filters.dateRange.end) count++;
    if (filters.sender !== 'all') count++;
    return count;
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Filter className="w-4 h-4" />
          Filters
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Message Types</label>
            <div className="flex flex-wrap gap-1">
              {['text', 'image', 'voice', 'file'].map(type => (
                <Button
                  key={type}
                  variant={filters.messageTypes.includes(type) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleMessageType(type)}
                  className="text-xs"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <div className="space-y-2">
              <Input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  dateRange: { ...filters.dateRange, start: e.target.value }
                })}
                placeholder="Start date"
                className="text-sm"
              />
              <Input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  dateRange: { ...filters.dateRange, end: e.target.value }
                })}
                placeholder="End date"
                className="text-sm"
              />
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SearchFilters;
