import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { CacheManager, CACHE_KEYS } from '@/utils/cacheManager';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryFn' | 'queryKey'> {
  queryFn: () => Promise<T>;
  cacheKey?: string;
  cacheTTL?: number;
  useMemoryCache?: boolean;
}

export const useOptimizedQuery = <T>(
  queryKey: (string | number)[],
  options: OptimizedQueryOptions<T>
) => {
  const {
    queryFn,
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5 minutes default
    useMemoryCache = true,
    ...queryOptions
  } = options;

  const cache = CacheManager.getInstance();
  const memoryCacheKey = cacheKey || queryKey.join('_');

  const optimizedQueryFn = async (): Promise<T> => {
    // Check memory cache first if enabled
    if (useMemoryCache) {
      const cachedData = cache.get(memoryCacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    // Fetch fresh data
    const data = await queryFn();

    // Store in memory cache if enabled
    if (useMemoryCache) {
      cache.set(memoryCacheKey, data, cacheTTL);
    }

    return data;
  };

  return useQuery({
    queryKey,
    queryFn: optimizedQueryFn,
    staleTime: cacheTTL / 2, // Consider data stale at half TTL
    gcTime: cacheTTL, // Keep in React Query cache for full TTL
    ...queryOptions
  });
};