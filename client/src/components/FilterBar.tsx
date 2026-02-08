import React from 'react';
import { Filter, ArrowUpDown, Star } from 'lucide-react';

type SortType = 'featured' | 'price-low-high' | 'price-high-low' | 'sale' | 'best-selling';

interface FilterBarProps {
  sortType: SortType;
  onSortChange: (sort: SortType) => void;
  onFilterOpen: () => void;
  hasActiveFilters: boolean;
  productCount?: number;
}

const FilterBar: React.FC<FilterBarProps> = ({
  sortType,
  onSortChange,
  onFilterOpen,
  hasActiveFilters,
  productCount
}) => {
  const sortOptions: { value: SortType; label: string }[] = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low-high', label: 'Price: Low→High' },
    { value: 'price-high-low', label: 'Price: High→Low' },
    { value: 'sale', label: 'Sale' },
    { value: 'best-selling', label: 'Best-Selling' }
  ];

  return (
    <div className="flex items-center justify-between gap-4">
      <button 
        onClick={onFilterOpen}
        className="h-10 px-6 py-2 rounded-full border-2 border-gray-300 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        data-testid="button-filter"
      >
        <Filter className="w-4 h-4 text-[#0074d4]" />
        Filter
        {hasActiveFilters && (
          <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            !
          </span>
        )}
      </button>
      
      <select
        value={sortType}
        onChange={(e) => onSortChange(e.target.value as SortType)}
        className="h-10 px-6 py-2 rounded-full border-2 border-gray-300 text-sm font-medium bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        data-testid="select-sort"
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
