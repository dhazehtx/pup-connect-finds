import { useEffect, useState, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
}

export const useInfiniteScroll = (
  hasMoreData: boolean,
  isLoading: boolean,
  loadMore: () => void,
  options: UseInfiniteScrollOptions = {}
) => {
  const { threshold = 0.1, rootMargin = '100px' } = options;
  const [sentinelRef, setSentinelRef] = useState<HTMLDivElement | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMoreData && !isLoading) {
        loadMore();
      }
    },
    [hasMoreData, isLoading, loadMore]
  );

  useEffect(() => {
    if (!sentinelRef) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    });

    observer.observe(sentinelRef);

    return () => {
      if (sentinelRef) {
        observer.unobserve(sentinelRef);
      }
    };
  }, [sentinelRef, handleIntersection, threshold, rootMargin]);

  return setSentinelRef;
};