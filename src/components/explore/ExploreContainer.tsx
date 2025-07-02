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

  // Initialize filters state with all advanced filter options
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
    availableOnly: false,
    coatType: 'all',
    energyLevel: 'all',
    size: 'all',
    priceRange: [0, 5000],
    color: 'all',
    trainingLevel: 'all',
    paperwork: 'all',
    minAge: '',
    maxAge: '',
    location: '',
    healthChecked: false,
    vaccinated: false,
    spayedNeutered: false,
    goodWithKids: false,
    goodWithPets: false,
    sortBy: 'newest'
  });
  
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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

  // Enhanced filtering to include all advanced filter options
  const filteredAndSortedListings = useMemo(() => {
    try {
      if (!Array.isArray(transformedListings) || transformedListings.length === 0) {
        console.log('No transformed listings to filter');
        return [];
      }

      let filtered = [...transformedListings];

      // Apply all filters
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

      if (filters.sourceType !== 'all') {
        filtered = filtered.filter(listing => listing.sourceType === filters.sourceType);
      }

      if (filters.gender !== 'all') {
        filtered = filtered.filter(listing => 
          listing.gender && listing.gender.toLowerCase() === filters.gender.toLowerCase()
        );
      }

      if (filters.ageGroup !== 'all') {
        filtered = filtered.filter(listing => {
          const age = parseInt(listing.age);
          if (filters.ageGroup === 'puppy') {
            return age <= 52;
          } else if (filters.ageGroup === 'young') {
            return age > 52 && age <= 156;
          } else if (filters.ageGroup === 'adult') {
            return age > 156;
          }
          return true;
        });
      }

      if (filters.color !== 'all') {
        filtered = filtered.filter(listing => 
          listing.color && listing.color.toLowerCase().includes(filters.color.toLowerCase())
        );
      }

      // Price range filter
      if (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000)) {
        filtered = filtered.filter(listing => {
          const price = parseInt(listing.price.replace(/[$,]/g, ''));
          return price >= filters.priceRange[0] && price <= filters.priceRange[1];
        });
      }

      // Age range filters
      if (filters.minAge) {
        const minAge = parseInt(filters.minAge);
        filtered = filtered.filter(listing => {
          const age = parseInt(listing.age);
          return age >= minAge;
        });
      }

      if (filters.maxAge) {
        const maxAge = parseInt(filters.maxAge);
        filtered = filtered.filter(listing => {
          const age = parseInt(listing.age);
          return age <= maxAge;
        });
      }

      // Location filter
      if (filters.location) {
        filtered = filtered.filter(listing =>
          listing.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }

      // Distance filter
      if (filters.maxDistance !== 'all') {
        const maxDist = parseInt(filters.maxDistance);
        filtered = filtered.filter(listing => {
          const distance = parseFloat(listing.distance);
          return distance <= maxDist;
        });
      }

      // Boolean filters
      if (filters.verifiedOnly) {
        filtered = filtered.filter(listing => listing.verified);
      }

      if (filters.availableOnly) {
        filtered = filtered.filter(listing => listing.available && listing.available > 0);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price-low':
          filtered.sort((a, b) => {
            const priceA = parseInt(a.price.replace(/[$,]/g, ''));
            const priceB = parseInt(b.price.replace(/[$,]/g, ''));
            return priceA - priceB;
          });
          break;
        case 'price-high':
          filtered.sort((a, b) => {
            const priceA = parseInt(a.price.replace(/[$,]/g, ''));
            const priceB = parseInt(b.price.replace(/[$,]/g, ''));
            return priceB - priceA;
          });
          break;
        case 'distance':
          filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
          break;
        case 'age-young':
          filtered.sort((a, b) => parseInt(a.age) - parseInt(b.age));
          break;
        case 'age-old':
          filtered.sort((a, b) => parseInt(b.age) - parseInt(a.age));
          break;
        case 'oldest':
          filtered.sort((a, b) => a.id - b.id);
          break;
        default: // newest
          filtered.sort((a, b) => b.id - a.id);
          break;
      }

      console.log('Filtered and sorted listings:', filtered);
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
      availableOnly: false,
      coatType: 'all',
      energyLevel: 'all',
      size: 'all',
      priceRange: [0, 5000],
      color: 'all',
      trainingLevel: 'all',
      paperwork: 'all',
      minAge: '',
      maxAge: '',
      location: '',
      healthChecked: false,
      vaccinated: false,
      spayedNeutered: false,
      goodWithKids: false,
      goodWithPets: false,
      sortBy: 'newest'
    });
    setShowAdvancedFilters(false);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'priceRange') {
      return value[0] > 0 || value[1] < 5000;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value !== '' && value !== 'all' && value !== 'newest';
    }
    return false;
  });

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

  const popularBreeds = ['Golden Retriever', 'Labrador Retriever', 'German Shepherd', 'French Bulldog', 'Bulldog', 'Poodle', 'Beagle', 'Rottweiler'];

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Puppy</h1>
          <p className="text-gray-600">Discover trusted breeders and loving companions</p>
        </div>

        {/* Filters Section */}
        <div className="mb-8">
          <ExploreFilters
            filters={filters}
            showAdvancedFilters={showAdvancedFilters}
            hasActiveFilters={hasActiveFilters}
            popularBreeds={popularBreeds}
            onFiltersUpdate={updateFilters}
            onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
            onResetFilters={resetFilters}
          />
        </div>

        {/* Popular Breeds Section - Only show when not using advanced filters */}
        {!showAdvancedFilters && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Breeds</h3>
            <div className="flex flex-wrap gap-2">
              {popularBreeds.map((breed) => (
                <button
                  key={breed}
                  onClick={() => updateFilters({ breed: breed.toLowerCase() })}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
                >
                  {breed}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Section */}
        <ExploreResults
          listings={filteredAndSortedListings}
          favorites={favorites}
          sortBy={filters.sortBy}
          hasActiveFilters={hasActiveFilters}
          onToggleFavorite={handleToggleFavorite}
          onContactSeller={handleContactSeller}
          onViewDetails={handleViewDetails}
          onResetFilters={resetFilters}
          onSortChange={(sortBy) => updateFilters({ sortBy })}
        />
      </div>
    </div>
  );
};

export default ExploreContainer;
