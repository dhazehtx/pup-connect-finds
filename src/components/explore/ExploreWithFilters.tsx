
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDogListings } from '@/hooks/useDogListings';
import { useAuth } from '@/contexts/AuthContext';
import ExploreHeader from './ExploreHeader';
import EnhancedFiltersPanel from './EnhancedFiltersPanel';
import ListingCard from './ListingCard';
import ListingsSkeleton from './ListingsSkeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const ExploreWithFilters = () => {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
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

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      handleSearch(value);
    }
  };

  const handleFilterUpdate = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
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

  const handleCreateListing = () => {
    if (!user && !isGuest) {
      navigate('/auth');
      return;
    }
    navigate('/post');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header - only show if no sticky header search is available */}
      <div className="md:hidden">
        <ExploreHeader
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          showAdvancedFilters={showAdvancedFilters}
          onToggleFilters={handleToggleFilters}
        />
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <EnhancedFiltersPanel
          filters={filters}
          onFilterUpdate={handleFilterUpdate}
          onClearAllFilters={handleClearAllFilters}
          popularBreeds={popularBreeds}
        />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Results Header with Create Listing Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {searchTerm ? `Search Results for "${searchTerm}"` : 'Explore Puppies'}
            </h1>
            <p className="text-gray-600 mt-1">
              {loading ? 'Searching...' : `${listings.length} puppies found`}
            </p>
          </div>
          
          <Button
            onClick={handleCreateListing}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Listing
          </Button>
        </div>

        {/* Listings Grid - Only shows dog_listings, NOT social posts */}
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
