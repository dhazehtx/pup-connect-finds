import { useMemo, useState, useCallback } from 'react';

interface SearchOptions<T> {
  searchFields: (keyof T)[];
  filterFunctions?: Record<string, (item: T, value: any) => boolean>;
  sortFunctions?: Record<string, (a: T, b: T) => number>;
}

export const useMemoizedSearch = <T>(
  data: T[],
  options: SearchOptions<T>
) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState<string>('');

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply search term
    if (searchTerm.trim()) {
      const lowercaseSearch = searchTerm.toLowerCase();
      result = result.filter(item =>
        options.searchFields.some(field => {
          const value = item[field];
          return String(value).toLowerCase().includes(lowercaseSearch);
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([filterKey, filterValue]) => {
      if (filterValue && options.filterFunctions?.[filterKey]) {
        result = result.filter(item =>
          options.filterFunctions![filterKey](item, filterValue)
        );
      }
    });

    // Apply sorting
    if (sortBy && options.sortFunctions?.[sortBy]) {
      result.sort(options.sortFunctions[sortBy]);
    }

    return result;
  }, [data, searchTerm, filters, sortBy, options]);

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
    setSortBy('');
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    updateFilter,
    sortBy,
    setSortBy,
    filteredData: filteredAndSortedData,
    clearFilters,
    totalResults: filteredAndSortedData.length
  };
};