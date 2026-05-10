import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useExploreFilters } from '@/context/ExploreFiltersContext';
import { filtersToSearchParams, searchParamsToFilters } from '@/lib/exploreFiltersUrl';

/**
 * Syncs URL search params with Explore filters: URL -> filters on load,
 * filters -> URL when user changes filters so shared links open with same filters.
 */
export function ExploreFiltersUrlSync() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, setFilters } = useExploreFilters();
  const isInitialMount = useRef(true);

  // Apply URL -> filters on mount and when URL changes (e.g. shared link / back)
  useEffect(() => {
    const parsed = searchParamsToFilters(searchParams);
    if (Object.keys(parsed).length === 0) return;
    setFilters((prev) => ({
      ...prev,
      ...parsed,
      price: parsed.price ?? prev.price,
      location: parsed.location ?? prev.location,
      age: parsed.age ?? prev.age,
      toggles: parsed.toggles ?? prev.toggles,
    }));
    isInitialMount.current = false;
  }, []); // only on mount; optional: add searchParams to deps to react to back/forward

  // When filters change (user interaction), update URL
  useEffect(() => {
    if (isInitialMount.current) return;
    const next = filtersToSearchParams(filters);
    const str = next.toString();
    const current = searchParams.toString();
    if (str === current) return;
    setSearchParams(next, { replace: true });
  }, [filters, setSearchParams, searchParams]);

  return null;
}
