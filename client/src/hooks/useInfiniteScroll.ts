import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  loadMore: () => void;
  threshold?: number;
}

export const useInfiniteScroll = (
  hasMore: boolean,
  isLoading: boolean,
  loadMore: () => void,
  threshold: number = 0.1
) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoading) {
        loadMore();
      }
    },
    [hasMore, isLoading, loadMore]
  );

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin: '20px'
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [handleObserver, threshold]);

  return sentinelRef;
};