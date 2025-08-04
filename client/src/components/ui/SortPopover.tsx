import * as Popover from '@radix-ui/react-popover';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const sortOptions = [
  'Featured',
  'Price ↑', 
  'Price ↓',
  'Rating',
  'Newest',
] as const;

type SortOption = typeof sortOptions[number];

interface SortPopoverProps {
  onSortChange?: (sort: SortOption) => void;
  className?: string;
}

export default function SortPopover({ onSortChange, className = '' }: SortPopoverProps) {
  const [sort, setSort] = useState<SortOption>('Featured');
  const [open, setOpen] = useState(false);

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    onSortChange?.(newSort);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      {/* Trigger pill */}
      <Popover.Trigger asChild>
        <button className={`
          inline-flex items-center gap-1 px-4 py-1.5 
          rounded-full border border-gray-300 bg-white
          text-sm font-medium text-gray-700
          hover:bg-gray-50 transition-colors
          focus-visible:!ring-0 focus-visible:!ring-offset-0
          ${className}
        `}>
          {sort}
          <ChevronDown className="w-4 h-4" />
        </button>
      </Popover.Trigger>

      {/* Popover / Sheet */}
      <Popover.Portal>
        {/* Mobile backdrop */}
        <div className="
          md:hidden fixed inset-0 bg-black/40 animate-fadeIn z-40
        " />

        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          className="
            z-50 w-48 rounded-xl bg-white shadow-lg p-4 space-y-1
            animate-scaleIn origin-top-right
            md:w-44
            /* Mobile sheet override */
            md:relative
            fixed md:static bottom-0 inset-x-0 md:inset-auto
            md:rounded-xl rounded-t-2xl
            md:animate-scaleIn animate-slideUp
          "
        >
          <h3 className="text-center font-medium mb-3 md:hidden text-gray-900">
            Sort products
          </h3>

          {sortOptions.map(opt => (
            <button
              key={opt}
              onClick={() => handleSortChange(opt)}
              className={`
                w-full text-left px-3 py-2 rounded-lg text-sm
                hover:bg-gray-50 transition-colors
                ${opt === sort ? 'font-semibold text-primary-600 bg-primary-50' : 'text-gray-700'}
              `}
            >
              {opt}
            </button>
          ))}

          {/* Mobile "Done" button */}
          <button
            onClick={() => setOpen(false)}
            className="
              md:hidden mt-3 block w-full rounded-full bg-primary-600
              text-white py-2 font-semibold text-sm
            "
          >
            Done
          </button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}