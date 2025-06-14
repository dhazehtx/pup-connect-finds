
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ExploreHeader from '@/components/explore/ExploreHeader';
import QuickFiltersBar from '@/components/explore/QuickFiltersBar';
import ExploreListingsGrid from '@/components/explore/ExploreListingsGrid';
import PopularBreeds from '@/components/explore/PopularBreeds';
import AdvancedFiltersPanel from '@/components/explore/AdvancedFiltersPanel';
import SearchFiltersCard from '@/components/search/SearchFiltersCard';
import ExploreLoading from '@/components/ExploreLoading';
import { useAuth } from '@/contexts/AuthContext';
import { useDogListings } from '@/hooks/useDogListings';
import { useMessaging } from '@/hooks/useMessaging';
import ErrorBoundary from '@/components/ErrorBoundary';

const Explore = () => {
  const { user } = useAuth();
  const { startConversation } = useMessaging();
  const { listings = [], loading } = useDogListings();
  
  console.log('Explore - listings:', listings, 'loading:', loading);
  
  // Initialize filters state
  const [filters, setFilters] = useState({
    searchTerm: '',
    breed: 'all',
    minPrice: '',
    maxPrice: '',
    ageGroup: 'all',
    gender: 'all',
    sourceType: 'all',
    maxDistance: 'all',
    verifiedOnly: false,
    availableOnly: false
  });
  
  const [sortBy, setSortBy] = useState('newest');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSearchFilters, setShowSearchFilters] = useState(false);
  const navigate = useNavigate();

  // Transform DogListing[] to Listing[] format with comprehensive safety
  const transformedListings = useMemo(() => {
    console.log('Transforming listings:', listings);
    
    if (!Array.isArray(listings)) {
      console.log('Listings is not an array:', listings);
      return [];
    }
    
    try {
      const validListings = listings.filter(listing => listing && typeof listing === 'object');
      console.log('Valid listings after filter:', validListings.length);
      
      if (validListings.length === 0) {
        console.log('No valid listings found');
        return [];
      }
      
      return validListings.map((listing, index) => {
        const transformedListing = {
          id: index + 1,
          title: listing?.dog_name || 'Unknown Dog',
          price: `$${listing?.price || 0}`,
          location: listing?.location || 'Unknown',
          distance: '5.0',
          breed: listing?.breed || 'Mixed Breed',
          color: 'Mixed',
          gender: 'Unknown',
          age: `${listing?.age || 0} weeks`,
          rating: 4.5,
          reviews: 10,
          image: listing?.image_url || '/placeholder-dog.jpg',
          breeder: listing?.profiles?.full_name || 'Unknown Breeder',
          verified: listing?.profiles?.verified || false,
          verifiedBreeder: listing?.profiles?.verified || false,
          idVerified: listing?.profiles?.verified || false,
          vetVerified: false,
          available: 1,
          sourceType: 'breeder',
          isKillShelter: false
        };
        
        console.log('Transformed listing:', transformedListing);
        return transformedListing;
      });
    } catch (error) {
      console.error('Error transforming listings:', error);
      return [];
    }
  }, [listings]);

  console.log('Transformed listings:', transformedListings);

  // Simple filtering without external hook to avoid crashes
  const sortedListings = useMemo(() => {
    try {
      if (!Array.isArray(transformedListings) || transformedListings.length === 0) {
        console.log('No transformed listings to sort');
        return [];
      }

      let filtered = [...transformedListings];

      // Apply filters
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(listing => 
          listing.title.toLowerCase().includes(searchLower) ||
          listing.breed.toLowerCase().includes(searchLower) ||
          listing.location.toLowerCase().includes(searchLower)
        );
      }

      if (filters.breed !== 'all') {
        filtered = filtered.filter(listing => 
          listing.breed.toLowerCase().includes(filters.breed.toLowerCase())
        );
      }

      if (filters.verifiedOnly) {
        filtered = filtered.filter(listing => listing.verified);
      }

      console.log('Filtered listings:', filtered);
      return filtered;
    } catch (error) {
      console.error('Error filtering listings:', error);
      return [];
    }
  }, [transformedListings, filters]);

  const updateFilters = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      breed: 'all',
      minPrice: '',
      maxPrice: '',
      ageGroup: 'all',
      gender: 'all',
      sourceType: 'all',
      maxDistance: 'all',
      verifiedOnly: false,
      availableOnly: false
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== 'all' && value !== false
  );

  const handleQuickFilterChange = (filterType: string, value: any) => {
    updateFilters({ [filterType]: value });
  };

  const handleQuickFilterClick = (filter: string) => {
    switch (filter) {
      case 'Puppies':
        updateFilters({ ageGroup: 'puppy' });
        break;
      case 'Verified':
        updateFilters({ verifiedOnly: true });
        break;
      case 'Nearby':
        updateFilters({ maxDistance: '10' });
        break;
      case 'Available':
        updateFilters({ availableOnly: true });
        break;
      default:
        break;
    }
  };

  const handleAdvancedFilterChange = (newFilters: any) => {
    updateFilters(newFilters);
  };

  const handleContactSeller = async (listing: any) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const conversationId = await startConversation(listing.user_id || 'user_1', listing.id);
      if (conversationId) {
        navigate('/messages');
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const handleToggleFavorite = (listingId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(listingId)) {
        newFavorites.delete(listingId);
      } else {
        newFavorites.add(listingId);
      }
      return newFavorites;
    });
  };

  const handleViewDetails = (listing: any) => {
    console.log('View details for listing:', listing);
  };

  // Convert filters to SearchFilters format with safety checks
  const searchFilters = {
    query: filters.searchTerm || '',
    breed: filters.breed !== 'all' ? filters.breed : undefined,
    minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
    minAge: undefined,
    maxAge: undefined,
    location: undefined,
    userType: filters.sourceType !== 'all' ? filters.sourceType as 'breeder' | 'shelter' : undefined,
    verified: filters.verifiedOnly || undefined,
  };

  const handleSearchFilterChange = (key: string, value: any) => {
    console.log('SearchFilterChange:', key, value);
    
    const filterMapping: { [key: string]: string } = {
      query: 'searchTerm',
      breed: 'breed',
      minPrice: 'minPrice',
      maxPrice: 'maxPrice',
      userType: 'sourceType',
      verified: 'verifiedOnly',
    };
    
    const filterKey = filterMapping[key] || key;
    updateFilters({ [filterKey]: value });
  };

  const popularBreeds = ['Golden Retriever', 'Labrador', 'German Shepherd', 'Bulldog', 'Poodle'];
  const dogColors = ['Black', 'Brown', 'White', 'Golden', 'Mixed'];
  const coatLengthOptions = ['Short', 'Medium', 'Long'];
  const distanceOptions = ['5', '10', '25', '50', '100'];
  const sizeOptions = ['Small', 'Medium', 'Large', 'Extra Large'];
  const energyLevels = ['Low', 'Medium', 'High'];
  const trainingLevels = ['Beginner', 'Intermediate', 'Advanced'];

  if (loading) {
    return (
      <Layout>
        <ExploreLoading />
      </Layout>
    );
  }

  // Add error boundary for SearchFiltersCard
  const renderSearchFilters = () => {
    try {
      return (
        <SearchFiltersCard
          showFilters={showSearchFilters}
          filters={searchFilters}
          onFilterChange={handleSearchFilterChange}
          onClearFilters={resetFilters}
          onToggleFilters={() => setShowSearchFilters(!showSearchFilters)}
        />
      );
    } catch (error) {
      console.error('Error rendering SearchFiltersCard:', error);
      return null;
    }
  };

  // Add error boundary for ExploreListingsGrid
  const renderListingsGrid = () => {
    try {
      if (!Array.isArray(sortedListings)) {
        console.warn('sortedListings is not an array:', sortedListings);
        return <div className="text-center py-8 text-gray-500">No listings available</div>;
      }

      if (sortedListings.length === 0) {
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or check back later for new listings.</p>
            {hasActiveFilters && (
              <button 
                onClick={resetFilters}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        );
      }

      return (
        <ErrorBoundary fallback={<div className="text-center py-8 text-red-500">Error loading listings</div>}>
          <ExploreListingsGrid 
            listings={sortedListings}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onContactSeller={handleContactSeller}
            onViewDetails={handleViewDetails}
          />
        </ErrorBoundary>
      );
    } catch (error) {
      console.error('Error rendering ExploreListingsGrid:', error);
      return <div className="text-center py-8 text-red-500">Error loading listings</div>;
    }
  };

  return (
    <ErrorBoundary>
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <ExploreHeader 
            searchTerm={filters.searchTerm}
            onSearchChange={(value) => updateFilters({ searchTerm: value })}
            showAdvancedFilters={showSearchFilters}
            onToggleFilters={() => setShowSearchFilters(!showSearchFilters)}
          />
          
          <div className="container mx-auto px-4 py-6">
            <QuickFiltersBar 
              quickFilters={['Puppies', 'Verified', 'Nearby', 'Available']}
              filters={filters}
              onQuickFilterClick={handleQuickFilterClick}
            />

            {/* Advanced Search Filters with error boundary */}
            {renderSearchFilters()}

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <ErrorBoundary fallback={<div className="text-sm text-gray-500">Error loading breeds</div>}>
                  <PopularBreeds 
                    popularBreeds={popularBreeds}
                    selectedBreed={filters.breed}
                    onBreedSelect={(breed) => handleQuickFilterChange('breed', breed)} 
                  />
                </ErrorBoundary>
              </div>

              <div className="lg:col-span-3">
                {renderListingsGrid()}
              </div>
            </div>
          </div>

          <ErrorBoundary fallback={<div className="text-sm text-gray-500">Error loading filters panel</div>}>
            <AdvancedFiltersPanel
              filters={filters}
              popularBreeds={popularBreeds}
              dogColors={dogColors}
              coatLengthOptions={coatLengthOptions}
              distanceOptions={distanceOptions}
              sizeOptions={sizeOptions}
              energyLevels={energyLevels}
              trainingLevels={trainingLevels}
              onFilterUpdate={updateFilters}
              onClearAllFilters={resetFilters}
            />
          </ErrorBoundary>
        </div>
      </Layout>
    </ErrorBoundary>
  );
};

export default Explore;
