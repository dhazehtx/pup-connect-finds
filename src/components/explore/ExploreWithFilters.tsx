
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDogListings } from '@/hooks/useDogListings';
import ExploreHeader from './ExploreHeader';
import EnhancedFiltersPanel from './EnhancedFiltersPanel';
import ListingCard from './ListingCard';
import ListingsSkeleton from './ListingsSkeleton';

const ExploreWithFilters = () => {
  const { listings, loading, searchListings } = useDogListings();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
  const popularBreeds = ['Golden Retriever', 'Labrador', 'German Shepherd', 'Bulldog', 'Poodle'];

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
    setShowAdvancedFilters(!showAdvancedFilters);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Single Sticky Header - Facebook Marketplace Style */}
      <div className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
        <ExploreHeader
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          showAdvancedFilters={showAdvancedFilters}
          onToggleFilters={handleToggleFilters}
        />
      </div>

      {/* Advanced Filters Panel - Toggleable */}
      {showAdvancedFilters && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <EnhancedFiltersPanel
            filters={filters}
            onFilterUpdate={handleFilterUpdate}
            onClearAllFilters={handleClearAllFilters}
            popularBreeds={popularBreeds}
          />
        </div>
      )}

      {/* Main Content - Clean Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Clean Context Header - Facebook Marketplace Style */}
        <div className="mt-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Explore Puppies
          </h1>
          <p className="text-gray-600">
            Use the search bar above or apply filters to find your perfect match.
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? 'Searching...' : `${listings.length} puppies found`}
          </p>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <ListingsSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {listings.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No puppies found matching your criteria.</p>
                <p className="text-gray-400 mt-2">Try adjusting your search terms or filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExploreWithFilters;
