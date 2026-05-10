import React from 'react';

export type StoreSortType = 'price-low-high' | 'price-high-low' | 'sale' | 'best-selling';

interface FilterBarProps {
  sortType: StoreSortType;
  onSortChange: (sort: StoreSortType) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ sortType, onSortChange }) => {
  const sortOptions: { value: StoreSortType; label: string }[] = [
    { value: 'price-low-high', label: 'Price: Low→High' },
    { value: 'price-high-low', label: 'Price: High→Low' },
    { value: 'sale', label: 'Sale' },
    { value: 'best-selling', label: 'Best-Selling' },
  ];

  return (
    <div className="flex w-full items-center justify-end gap-3">
      <label htmlFor="store-sort" className="sr-only">
        Sort products
      </label>
      <select
        id="store-sort"
        value={sortType}
        onChange={(e) => onSortChange(e.target.value as StoreSortType)}
        className="h-10 cursor-pointer rounded-full border-2 border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0074d4] focus-visible:ring-offset-2 active:scale-[0.98]"
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
