import { useInfiniteQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { cacheService, CACHE_KEYS } from '@/utils/cacheService';

interface PaginatedQueryOptions<T> {
  queryKey: string[];
  fetchFn: (cursor?: string) => Promise<{ data: T[]; nextCursor?: string; hasMore: boolean }>;
  pageSize?: number;
  cacheTime?: number;
  staleTime?: number;
}

export const usePaginatedQuery = <T>({
  queryKey,
  fetchFn,
  pageSize = 20,
  cacheTime = 300000, // 5 minutes
  staleTime = 60000   // 1 minute
}: PaginatedQueryOptions<T>) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const cacheKey = `${queryKey.join('_')}_${pageParam || 'first'}`;
      
      // Try cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Fetch fresh data
      const result = await fetchFn(pageParam);
      
      // Cache the result
      await cacheService.set(cacheKey, result, {
        memoryTTL: staleTime,
        localTTL: cacheTime
      });

      return result;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    staleTime,
    gcTime: cacheTime
  });

  const loadMore = async () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      setIsLoadingMore(true);
      await query.fetchNextPage();
      setIsLoadingMore(false);
    }
  };

  const allData = useMemo(() => {
    return query.data?.pages.flatMap(page => page.data) || [];
  }, [query.data]);

  return {
    data: allData,
    isLoading: query.isLoading,
    isLoadingMore: isLoadingMore || query.isFetchingNextPage,
    hasMore: query.hasNextPage,
    error: query.error,
    loadMore,
    refetch: query.refetch,
    totalPages: query.data?.pages.length || 0
  };
};