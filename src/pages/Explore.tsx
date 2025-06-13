import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ExploreHeader from '@/components/explore/ExploreHeader';
import QuickFiltersBar from '@/components/explore/QuickFiltersBar';
import ExploreListingsGrid from '@/components/explore/ExploreListingsGrid';
import PopularBreeds from '@/components/explore/PopularBreeds';
import AdvancedFiltersPanel from '@/components/explore/AdvancedFiltersPanel';
import ExploreLoading from '@/components/ExploreLoading';
import { useAuth } from '@/contexts/AuthContext';
import { useDogListings } from '@/hooks/useDogListings';
import { useListingFilters } from '@/hooks/useListingFilters';
import { useMessaging } from '@/hooks/useMessaging';

const Explore = () => {
  const { user } = useAuth();
  const { startConversation } = useMessaging();
  const { listings, loading } = useDogListings();
  
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
  const navigate = useNavigate();

  // Transform DogListing[] to Listing[] format expected by useListingFilters
  const transformedListings = listings.map((listing, index) => ({
    id: index + 1,
    title: listing.dog_name,
    price: `$${listing.price}`,
    location: listing.location || 'Unknown',
    distance: '5.0',
    breed: listing.breed,
    color: 'Mixed',
    gender: 'Unknown',
    age: `${listing.age} weeks`,
    rating: 4.5,
    reviews: 10,
    image: listing.image_url || '/placeholder-dog.jpg',
    breeder: listing.profiles?.full_name || 'Unknown Breeder',
    verified: listing.profiles?.verified || false,
    verifiedBreeder: listing.profiles?.verified || false,
    idVerified: listing.profiles?.verified || false,
    vetVerified: false,
    available: 1,
    sourceType: 'breeder',
    isKillShelter: false
  }));

  const { sortedListings } = useListingFilters(transformedListings, filters, sortBy);

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

  // Create a handler that matches QuickFiltersBar's expected signature
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
    // Navigate to listing details page
    console.log('View details for listing:', listing);
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <ExploreHeader 
          searchTerm={filters.searchTerm}
          onSearchChange={(value) => updateFilters({ searchTerm: value })}
          showAdvancedFilters={showAdvancedFilters}
          onToggleFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
        />
        
        <div className="container mx-auto px-4 py-6">
          <QuickFiltersBar 
            quickFilters={['Puppies', 'Verified', 'Nearby', 'Available']}
            filters={filters}
            onQuickFilterClick={handleQuickFilterClick}
          />

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <PopularBreeds 
                popularBreeds={popularBreeds}
                selectedBreed={filters.breed}
                onBreedSelect={(breed) => handleQuickFilterChange('breed', breed)} 
              />
            </div>

            <div className="lg:col-span-3">
              <ExploreListingsGrid 
                listings={sortedListings}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onContactSeller={handleContactSeller}
                onViewDetails={handleViewDetails}
              />
            </div>
          </div>
        </div>

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
      </div>
    </Layout>
  );
};

export default Explore;
