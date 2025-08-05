import React from 'react';
import { Filter, ArrowUpDown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SortType = 'featured' | 'price-low-high' | 'price-high-low' | 'sale' | 'best-selling';

interface FilterBarProps {
  sortType: SortType;
  onSortChange: (sort: SortType) => void;
  onFilterOpen: () => void;
  hasActiveFilters: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  sortType,
  onSortChange,
  onFilterOpen,
  hasActiveFilters
}) => {
  const sortOptions: { value: SortType; label: string; icon: React.ReactNode }[] = [
    { value: 'featured', label: 'Featured', icon: <Star className="w-4 h-4" /> },
    { value: 'price-low-high', label: 'Price: Low→High', icon: <ArrowUpDown className="w-4 h-4" /> },
    { value: 'price-high-low', label: 'Price: High→Low', icon: <ArrowUpDown className="w-4 h-4 rotate-180" /> },
    { value: 'sale', label: 'Sale', icon: <Filter className="w-4 h-4" /> },
    { value: 'best-selling', label: 'Best-Selling', icon: <Star className="w-4 h-4" /> }
  ];

  const currentSort = sortOptions.find(opt => opt.value === sortType);

  return (
    <div className="flex items-center justify-between">
      {/* Filter Button */}
      <Button 
        onClick={onFilterOpen}
        className="flex items-center gap-2 border border-gray-400 text-gray-700 bg-white rounded-full px-6 py-2 hover:bg-gray-50 transition-colors"
      >
        <Filter className="h-4 w-4 text-gray-700" />
        Filter
        {hasActiveFilters && (
          <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
            !
          </span>
        )}
      </Button>
      
      {/* Sort Dropdown */}
      <select
        value={sortType}
        onChange={(e) => onSortChange(e.target.value as SortType)}
        className="border border-gray-400 text-gray-700 bg-white rounded-full px-6 py-2 hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterBar;