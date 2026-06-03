import * as React from 'react';
import { cn } from '@/lib/utils';

export const EXPLORE_SEARCH_PLACEHOLDER = 'Search for puppies, breeds, or locations...';

export type ExploreTrendingItem =
  | { kind: 'query'; label: string; query: string }
  | { kind: 'sort'; label: string; sortBy: 'newest' };

export const DEFAULT_EXPLORE_TRENDING: ExploreTrendingItem[] = [
  { kind: 'query', label: 'Golden Retriever', query: 'Golden Retriever' },
  { kind: 'query', label: 'Near Houston', query: 'Houston' },
  { kind: 'sort', label: 'New Arrivals', sortBy: 'newest' },
];

/** Stroke-only magnifier — avoids Lucide + global CSS fill conflicts on mobile Safari */
function SearchMagnifierIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('paws-search-icon block shrink-0', className)}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

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
  const showTrending = Boolean(trending?.length && onTrendingPick && !value.trim());

  return (
    <div className={cn('paws-universal-search w-full min-w-0', className)} data-testid={dataTestId}>
      <div
        className={cn(
          'paws-universal-search__bar flex w-full min-w-0 items-stretch overflow-hidden rounded-full border border-slate-200/90 bg-white shadow-sm transition-shadow',
          'focus-within:border-blue-300/80 focus-within:shadow-md focus-within:ring-2 focus-within:ring-blue-500/20',
        )}
      >
        <input
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
            'min-w-0 flex-1 border-0 bg-slate-50/90 px-4 py-0 text-sm leading-none text-slate-900 shadow-none outline-none ring-0',
            'placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:text-[15px]',
          )}
        />
        <button
          type="button"
          className={cn(
            'paws-search-submit inline-flex shrink-0 items-center justify-center rounded-r-full bg-blue-600 text-white transition-colors',
            'hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
            h,
            inputSize === 'lg' ? 'min-w-[52px] px-4' : 'min-w-[48px] px-3.5',
          )}
          aria-label="Search"
        >
          <SearchMagnifierIcon />
        </button>
      </div>

      {showTrending && (
        <div className="paws-universal-search__trending mt-3.5 space-y-2.5">
          <p className="text-xs font-medium text-slate-500">Trending searches</p>
          <div className="flex flex-wrap gap-2.5">
            {trending!.map((item) => (
              <button
                key={item.label}
                type="button"
                className={cn(
                  'inline-flex min-h-[40px] max-w-full items-center justify-center rounded-full border border-slate-200/90 bg-slate-50/95',
                  'px-4 py-2 text-left text-sm font-medium leading-snug text-slate-700',
                  'whitespace-normal text-wrap transition',
                  'hover:border-blue-200 hover:bg-blue-50/90 active:bg-blue-100/80',
                )}
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
