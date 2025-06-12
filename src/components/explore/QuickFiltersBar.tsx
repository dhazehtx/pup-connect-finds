
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface QuickFiltersBarProps {
  quickFilters: string[];
  filters: any;
  onQuickFilterClick: (filter: string) => void;
}

const QuickFiltersBar = ({ quickFilters, filters, onQuickFilterClick }: QuickFiltersBarProps) => {
  return (
    <div className="bg-white px-4 py-4 border-b border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Filters</h3>
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => (
          <Badge
            key={filter}
            variant="outline"
            className="cursor-pointer hover:bg-gray-100"
            onClick={() => onQuickFilterClick(filter)}
          >
            {filter}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default QuickFiltersBar;
