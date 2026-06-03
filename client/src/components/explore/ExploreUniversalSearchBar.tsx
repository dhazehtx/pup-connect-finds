import * as React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const EXPLORE_SEARCH_PLACEHOLDER = 'Search for puppies, breeds, or locations...';

export type ExploreTrendingItem =
  | { kind: 'query'; label: string; query: string }
  | { kind: 'sort'; label: string; sortBy: 'newest' };

export const DEFAULT_EXPLORE_TRENDING: ExploreTrendingItem[] = [
  { kind: 'query', label: '🐾 Golden Retrievers', query: 'Golden Retriever' },
  { kind: 'query', label: '🐾 Near Houston', query: 'Houston' },
  { kind: 'sort', label: '🐾 New Arrivals', sortBy: 'newest' },
];

type ExploreUniversalSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  /** Optional chips when the field is empty (zero state). */
  trending?: ExploreTrendingItem[];
  onTrendingPick?: (item: ExploreTrendingItem) => void;
  /** Match input + button height (default 44px). */
  inputSize?: 'md' | 'lg';
  'data-testid'?: string;
};

/**
 * Pill search + brand blue action button (icon only in the button, not inside the field).
 * Use one wrapper so the bar reads as a single unit with shadow-sm.
 */
export function ExploreUniversalSearchBar({
  value,
  onChange,
  placeholder = EXPLORE_SEARCH_PLACEHOLDER,
  id = 'explore-universal-search',
  className,
  trending,
  onTrendingPick,
  inputSize = 'md',
  'data-testid': dataTestId,
}: ExploreUniversalSearchBarProps) {
  const h = inputSize === 'lg' ? 'h-12 min-h-[48px]' : 'h-11 min-h-[44px]';
  const iconClass = inputSize === 'lg' ? 'h-5 w-5' : 'h-5 w-5';
  const showTrending = Boolean(trending?.length && onTrendingPick && !value.trim());

  return (
    <div className={cn('w-full min-w-0', className)} data-testid={dataTestId}>
      <div
        className={cn(
          'flex w-full min-w-0 overflow-hidden rounded-full border border-slate-200/90 bg-white shadow-sm transition-shadow focus-within:border-blue-300/80 focus-within:shadow-md focus-within:ring-2 focus-within:ring-blue-500/20',
        )}
      >
        <Input
          id={id}
          type="search"
          name="q"
          enterKeyHint="search"
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            h,
            'min-w-0 flex-1 rounded-none border-0 bg-slate-50 px-4 py-0 text-sm text-slate-900 shadow-none ring-0 ring-offset-0 placeholder:text-slate-400 focus-visible:ring-0 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder:text-slate-500 sm:text-[15px]',
          )}
        />
        <button
          type="button"
          className={cn(
            'inline-flex shrink-0 items-center justify-center rounded-r-full bg-blue-600 px-4 text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
            h,
          )}
          aria-label="Search"
        >
          <Search
            className={cn(iconClass, 'explore-search-icon shrink-0')}
            strokeWidth={2.25}
            aria-hidden
          />
        </button>
      </div>

      {showTrending && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Trending searches</p>
          <div className="flex flex-wrap gap-2">
            {trending!.map((item) => (
              <button
                key={item.label}
                type="button"
                className="inline-flex max-w-full items-center gap-1 rounded-full border border-slate-200/90 bg-slate-50/95 px-3 py-1.5 text-left text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/90 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-blue-500/50 dark:hover:bg-slate-800 sm:text-sm"
                onClick={() => onTrendingPick!(item)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
