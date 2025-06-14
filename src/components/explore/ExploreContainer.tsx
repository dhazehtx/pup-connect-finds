import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ExploreFilters from '@/components/explore/ExploreFilters';
import ExploreResults from '@/components/explore/ExploreResults';
import { useAuth } from '@/contexts/AuthContext';
import { useMessaging } from '@/hooks/useMessaging';

// Database listing type from the hook
interface DatabaseListing {
  id: string;
  dog_name?: string;
  breed?: string;
  age?: number;
  price?: number;
  location?: string;
  image_url?: string;
  profiles?: {
    full_name?: string;
    verified?: boolean;
  };
}

// Transformed listing type for the UI
interface TransformedListing {
  id: number;
  title: string;
  breed: string;
  age: string;
  location: string;
  distance: string;
  price: string;
  image: string;
  verified: boolean;
  sourceType?: string;
  rating: number;
  reviews: number;
  breeder: string;
  color?: string;
  gender?: string;
  verifiedBreeder?: boolean;
  idVerified?: boolean;
  vetVerified?: boolean;
  available?: number;
  isKillShelter?: boolean;
}

interface ExploreContainerProps {
  listings: DatabaseListing[];
}

const ExploreContainer = ({ listings }: ExploreContainerProps) => {
  const { user } = useAuth();
  const { startConversation } = useMessaging();
  const navigate = useNavigate();

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
  const [showSearchFilters, setShowSearchFilters] = useState(false);

  // Transform DatabaseListing[] to TransformedListing[] format with comprehensive safety
  const transformedListings = useMemo((): TransformedListing[] => {
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
      
      return validListings.map((listing, index): TransformedListing => {
        const transformedListing: TransformedListing = {
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

  const popularBreeds = ['Golden Retriever', 'Labrador', 'German Shepherd', 'Bulldog', 'Poodle'];
  const dogColors = ['Black', 'Brown', 'White', 'Golden', 'Mixed'];
  const coatLengthOptions = ['Short', 'Medium', 'Long'];
  const distanceOptions = ['5', '10', '25', '50', '100'];
  const sizeOptions = ['Small', 'Medium', 'Large', 'Extra Large'];
  const energyLevels = ['Low', 'Medium', 'High'];
  const trainingLevels = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="container mx-auto px-4 py-6 bg-white min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ExploreFilters
            filters={filters}
            showSearchFilters={showSearchFilters}
            hasActiveFilters={hasActiveFilters}
            popularBreeds={popularBreeds}
            dogColors={dogColors}
            coatLengthOptions={coatLengthOptions}
            distanceOptions={distanceOptions}
            sizeOptions={sizeOptions}
            energyLevels={energyLevels}
            trainingLevels={trainingLevels}
            onFiltersUpdate={updateFilters}
            onQuickFilterClick={handleQuickFilterClick}
            onToggleSearchFilters={() => setShowSearchFilters(!showSearchFilters)}
            onResetFilters={resetFilters}
          />
        </div>

        <div className="lg:col-span-3">
          <ExploreResults
            listings={sortedListings}
            favorites={favorites}
            sortBy={sortBy}
            hasActiveFilters={hasActiveFilters}
            onToggleFavorite={handleToggleFavorite}
            onContactSeller={handleContactSeller}
            onViewDetails={handleViewDetails}
            onResetFilters={resetFilters}
            onSortChange={setSortBy}
          />
        </div>
      </div>
    </div>
  );
};

export default ExploreContainer;
