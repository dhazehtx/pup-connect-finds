
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDogListings } from '@/hooks/useDogListings';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import ExploreHeader from './ExploreHeader';
import AdvancedFiltersPanel from './AdvancedFiltersPanel';
import ListingCard from './ListingCard';
import ListingsSkeleton from './ListingsSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Star } from 'lucide-react';

const ExploreWithFreemium = () => {
  const { user, isGuest } = useAuth();
  const { subscribed } = useSubscription();
  const { listings, loading, searchListings } = useDogListings();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    breed: '',
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    location: '',
    ageRange: [0, 12] as [number, number],
  });

  // Sample data for filters
  const popularBreeds = ['All Breeds', 'Golden Retriever', 'Labrador', 'German Shepherd', 'Bulldog', 'Poodle'];
  const dogColors = ['Black', 'Brown', 'White', 'Golden', 'Gray', 'Mixed'];
  const coatLengthOptions = ['Short', 'Medium', 'Long', 'Curly'];
  const distanceOptions = ['5', '10', '25', '50', '100'];
  const sizeOptions = ['Small', 'Medium', 'Large', 'Extra Large'];
  const energyLevels = ['Low', 'Medium', 'High', 'Very High'];
  const trainingLevels = ['Untrained', 'Basic', 'Intermediate', 'Advanced'];

  useEffect(() => {
    const initialSearch = searchParams.get('search');
    if (initialSearch) {
      setSearchTerm(initialSearch);
      handleSearch(initialSearch);
    }
  }, [searchParams]);

  const handleSearch = async (query: string) => {
    try {
      await searchListings(query, filters);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    handleSearch(searchTerm);
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
      minPrice: undefined,
      maxPrice: undefined,
      location: '',
      ageRange: [0, 12] as [number, number],
    };
    setFilters(clearedFilters);
    handleSearch(searchTerm);
  };

  // Freemium logic - limit results for non-premium users
  const isFreemiumUser = !user || !subscribed || isGuest;
  const maxResults = isFreemiumUser ? 10 : listings.length;
  const displayedListings = listings.slice(0, maxResults);
  const hasMoreResults = listings.length > maxResults;

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
        <AdvancedFiltersPanel
          filters={filters}
          popularBreeds={popularBreeds}
          dogColors={dogColors}
          coatLengthOptions={coatLengthOptions}
          distanceOptions={distanceOptions}
          sizeOptions={sizeOptions}
          energyLevels={energyLevels}
          trainingLevels={trainingLevels}
          onFilterUpdate={handleFilterUpdate}
          onClearAllFilters={handleClearAllFilters}
        />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {searchTerm ? `Search Results for "${searchTerm}"` : 'Explore Puppies'}
            </h1>
            <p className="text-gray-600 mt-1">
              {loading ? 'Searching...' : `${listings.length} puppies found`}
            </p>
          </div>
          
          {isFreemiumUser && (
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <Crown className="w-3 h-3 mr-1" />
              Free Plan
            </Badge>
          )}
        </div>

        {/* Listings Grid */}
        {loading ? (
          <ListingsSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {/* Freemium Upgrade Prompt */}
            {hasMoreResults && isFreemiumUser && (
              <Card className="mt-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Crown className="w-8 h-8 text-blue-600 mr-2" />
                    <Star className="w-6 h-6 text-yellow-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    See All {listings.length - maxResults}+ More Puppies
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Upgrade to Premium to view unlimited search results and unlock exclusive features
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                      Upgrade to Premium
                    </button>
                    <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg font-medium">
                      Learn More
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {displayedListings.length === 0 && !loading && (
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

export default ExploreWithFreemium;
