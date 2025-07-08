
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDogListings } from '@/hooks/useDogListings';
import ExploreHeader from './ExploreHeader';
import CollapsibleFiltersPanel from './CollapsibleFiltersPanel';
import ListingCard from './ListingCard';
import ListingsSkeleton from './ListingsSkeleton';

const ExploreWithFilters = () => {
  const { listings, loading, searchListings } = useDogListings();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const [filters, setFilters] = useState({
    breed: '',
    gender: '',
    size: '',
    color: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    vaccinated: false,
    neutered_spayed: false,
    good_with_kids: false,
    good_with_dogs: false,
    delivery_available: false,
    rehoming: false,
  });

  // Sample data for filters
  const popularBreeds = ['Golden Retriever', 'Labrador', 'German Shepherd', 'Bulldog', 'Poodle', 'French Bulldog', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund'];

  // Sort listings based on sortBy value
  const sortedListings = React.useMemo(() => {
    if (!listings || listings.length === 0) return [];
    
    const sorted = [...listings];
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-high':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'age-young':
        return sorted.sort((a, b) => (a.age || 0) - (b.age || 0));
      case 'distance':
        // For now, sort by location alphabetically since we don't have actual distance data
        return sorted.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
      case 'rating':
        // Placeholder for rating sort - would need rating data from backend
        return sorted;
      default: // newest
        return sorted.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }
  }, [listings, sortBy]);

  useEffect(() => {
    const initialSearch = searchParams.get('search');
    if (initialSearch) {
      setSearchTerm(initialSearch);
      handleSearch(initialSearch);
    } else {
      // Load all listings on initial page load
      handleSearch('');
    }
  }, [searchParams]);

  const handleSearch = async (query: string) => {
    try {
      const searchFilters = {
        ...filters,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
      };
      await searchListings(query, searchFilters);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleToggleFilters = () => {
    setShowFiltersPanel(!showFiltersPanel);
  };

  // Real-time search with debouncing
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  const handleFilterUpdate = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // Re-search with updated filters
    handleSearch(searchTerm);
  };

  const handleClearAllFilters = () => {
    const clearedFilters = {
      breed: '',
      gender: '',
      size: '',
      color: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      vaccinated: false,
      neutered_spayed: false,
      good_with_kids: false,
      good_with_dogs: false,
      delivery_available: false,
      rehoming: false,
    };
    setFilters(clearedFilters);
    handleSearch(searchTerm);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Single Sticky Header - Facebook Marketplace Style */}
      <div className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
        <ExploreHeader
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          showAdvancedFilters={showFiltersPanel}
          onToggleFilters={handleToggleFilters}
        />
      </div>

      {/* Collapsible Filters Panel */}
      <CollapsibleFiltersPanel
        isOpen={showFiltersPanel}
        onClose={() => setShowFiltersPanel(false)}
        filters={filters}
        onFilterUpdate={handleFilterUpdate}
        onClearAllFilters={handleClearAllFilters}
        onApplyFilters={handleApplyFilters}
        popularBreeds={popularBreeds}
        sortBy={sortBy}
        onSortChange={handleSortChange}
      />

      {/* Main Content - Clean Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Clean Context Header - Facebook Marketplace Style */}
        <div className="mt-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Explore Puppies
          </h1>
          <div className="flex items-center gap-4 text-gray-600">
            <span>📍 Showing puppies near your location</span>
            <span>•</span>
            <span>{loading ? 'Searching...' : `${sortedListings.length} puppies found`}</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Use the search bar above or apply filters to find your perfect match.
          </p>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <ListingsSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {sortedListings.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🐶</div>
                <p className="text-gray-500 text-lg mb-2">No puppies found?</p>
                <p className="text-gray-400">Try adjusting your filters or check nearby areas.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExploreWithFilters;
