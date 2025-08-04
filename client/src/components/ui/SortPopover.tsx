import { useState } from 'react';
import clsx from 'clsx';

const sortOptions = [
  'Featured',
  'Price ↑', 
  'Price ↓',
  'Rating',
  'Newest',
  'Oldest'
] as const;

type SortOption = typeof sortOptions[number];

interface SortChipsProps {
  onSortChange?: (sort: SortOption) => void;
  className?: string;
}

export default function SortChips({ onSortChange, className = '' }: SortChipsProps) {
  const [sort, setSort] = useState<SortOption>('Featured');

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    onSortChange?.(newSort);
  };

  return (
    <div className={`flex overflow-x-auto gap-2 scrollbar-hide ${className}`}>
      {sortOptions.map(option => (
        <button
          key={option}
          onClick={() => handleSortChange(option)}
          className={clsx(
            'px-4 py-1.5 rounded-full whitespace-nowrap border text-sm font-medium transition-all duration-200 focus-visible:!ring-0 focus-visible:!ring-offset-0',
            sort === option
              ? 'bg-primary-600 text-white border-primary-600'
              : 'text-primary-600 border-primary-600 bg-white hover:bg-primary-50'
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}