import React, { useMemo, useState, useCallback } from 'react';
import { useVirtualizedList } from '@/hooks/useVirtualizedList';
import { useMemoizedSearch } from '@/hooks/useMemoizedSearch';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { OptimizedListingCard } from '@/components/listings/OptimizedListingCard';
import { StaggeredList } from '@/components/ui/transitions';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loading';
import { performanceUtils } from '@/utils/performanceOptimizations';

interface Listing {
  id: string;
  title: string;
  breed: string;
  price: number;
  location: string;
  image_url?: string;
  seller_name?: string;
  age?: string;
  gender?: string;
  created_at: string;
}

interface ExploreGridProps {
  searchTerm?: string;
  filters?: Record<string, any>;
  onListingClick?: (listing: Listing) => void;
}

const GRID_ITEM_HEIGHT = 280; // Approximate height of each listing card
const CONTAINER_HEIGHT = 600; // Height of virtualized container

export const OptimizedExploreGrid: React.FC<ExploreGridProps> = ({
  searchTerm = '',
  filters = {},
  onListingClick
}) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Memoized search and filtering
  const searchOptions = useMemo(() => ({
    searchFields: ['title', 'breed', 'location'] as (keyof Listing)[],
    filterFunctions: {
      breed: (item: Listing, value: string) => 
        !value || item.breed.toLowerCase().includes(value.toLowerCase()),
      priceRange: (item: Listing, range: { min?: number; max?: number }) => {
        if (!range.min && !range.max) return true;
        if (range.min && item.price < range.min) return false;
        if (range.max && item.price > range.max) return false;
        return true;
      },
      location: (item: Listing, value: string) =>
        !value || item.location.toLowerCase().includes(value.toLowerCase())
    },
    sortFunctions: {
      newest: (a: Listing, b: Listing) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      price_low: (a: Listing, b: Listing) => a.price - b.price,
      price_high: (a: Listing, b: Listing) => b.price - a.price,
      alphabetical: (a: Listing, b: Listing) => a.title.localeCompare(b.title)
    }
  }), []);

  // Paginated data fetching
  const {
    data: listings,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    error
  } = usePaginatedQuery<Listing>({
    queryKey: ['explore-listings', searchTerm, JSON.stringify(filters)],
    fetchFn: async (cursor) => {
      // Simulate API call - replace with actual API
      const response = await fetch(`/api/listings?cursor=${cursor || ''}&search=${searchTerm}&filters=${JSON.stringify(filters)}`);
      return response.json();
    },
    pageSize: 20
  });

  // Apply search and filtering to fetched data
  const {
    filteredData,
    setSearchTerm: setLocalSearch,
    updateFilter,
    setSortBy
  } = useMemoizedSearch(listings, searchOptions);

  // Debounced search to avoid excessive API calls
  const debouncedSearch = useMemo(
    () => performanceUtils.debounce(setLocalSearch, 300),
    [setLocalSearch]
  );

  // Update search term with debouncing
  React.useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Apply filters
  React.useEffect(() => {
    Object.entries(filters).forEach(([key, value]) => {
      updateFilter(key, value);
    });
  }, [filters, updateFilter]);

  // Virtualized list for performance with large datasets
  const {
    visibleItems,
    visibleRange,
    totalHeight,
    offsetY,
    handleScroll
  } = useVirtualizedList(filteredData, {
    itemHeight: GRID_ITEM_HEIGHT,
    containerHeight: CONTAINER_HEIGHT,
    overscan: 5
  });

  // Infinite scroll
  const sentinelRef = useInfiniteScroll(hasMore, isLoadingMore, loadMore);

  // Memoized favorite handler
  const handleFavorite = useCallback((listingId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(listingId)) {
        newFavorites.delete(listingId);
      } else {
        newFavorites.add(listingId);
      }
      return newFavorites;
    });
  }, []);

  // Memoized listing click handler
  const handleListingClick = useCallback((listing: Listing) => {
    onListingClick?.(listing);
  }, [onListingClick]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Error loading listings. Please try again.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredData.length} puppies found
      </div>

      {/* Grid with Virtualization for Large Lists */}
      {filteredData.length > 50 ? (
        <div
          className="relative overflow-auto"
          style={{ height: CONTAINER_HEIGHT }}
          onScroll={handleScroll}
        >
          <div style={{ height: totalHeight, position: 'relative' }}>
            <div
              style={{
                transform: `translateY(${offsetY}px)`,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0
              }}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {visibleItems.map((listing, index) => (
                  <OptimizedListingCard
                    key={listing.id}
                    listing={listing}
                    index={visibleRange.start + index}
                    onFavorite={handleFavorite}
                    isFavorited={favorites.has(listing.id)}
                    className="cursor-pointer"
                    onClick={() => handleListingClick(listing)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Regular Grid for Smaller Lists
        <StaggeredList
          staggerDelay={0.05}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {filteredData.map((listing, index) => (
            <OptimizedListingCard
              key={listing.id}
              listing={listing}
              index={index}
              onFavorite={handleFavorite}
              isFavorited={favorites.has(listing.id)}
              className="cursor-pointer"
              onClick={() => handleListingClick(listing)}
            />
          ))}
        </StaggeredList>
      )}

      {/* Infinite Scroll Trigger */}
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          {isLoadingMore && <LoadingSpinner text="Loading more puppies..." />}
        </div>
      )}

      {/* No Results */}
      {filteredData.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No puppies found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};