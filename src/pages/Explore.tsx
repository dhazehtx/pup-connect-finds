
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDogListings } from '@/hooks/useDogListings';
import { useFavorites } from '@/hooks/useFavorites';
import { useMessaging } from '@/hooks/useMessaging';
import ListingCard from '@/components/ListingCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import EnhancedSearchBar from '@/components/search/EnhancedSearchBar';
import CreateListingDialog from '@/components/listings/CreateListingDialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SearchFilters {
  query: string;
  breed: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  minAge: number;
  maxAge: number;
}

const Explore = () => {
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({
    query: '',
    breed: '',
    location: '',
    minPrice: 0,
    maxPrice: 5000,
    minAge: 0,
    maxAge: 15,
  });
  
  const { user } = useAuth();
  const { listings, loading, fetchListings } = useDogListings();
  const { toggleFavorite, isFavorited } = useFavorites();
  const { createConversation } = useMessaging();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSearch = (filters: SearchFilters) => {
    setActiveFilters(filters);
    
    // Convert filters to the format expected by fetchListings
    const searchFilters = {
      breed: filters.breed,
      location: filters.location,
      minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
      maxPrice: filters.maxPrice < 5000 ? filters.maxPrice : undefined,
      // For text search, we'll use the breed field if no specific breed is selected
      ...(filters.query && !filters.breed && { breed: filters.query })
    };

    fetchListings(searchFilters);
  };

  const handleFavorite = async (listingId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      });
      return;
    }
    
    await toggleFavorite(listingId);
  };

  const handleContact = async (listingId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to contact sellers",
        variant: "destructive",
      });
      return;
    }

    try {
      const listing = listings.find(l => l.id === listingId);
      if (!listing) return;

      const conversationId = await createConversation(listingId, listing.user_id);
      if (conversationId) {
        navigate('/messages');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleViewDetails = (listingId: string) => {
    navigate(`/listing/${listingId}`);
  };

  // Filter listings based on age range if not already filtered by backend
  const filteredListings = listings.filter(listing => {
    const ageInRange = listing.age >= activeFilters.minAge && listing.age <= activeFilters.maxAge;
    const queryMatch = !activeFilters.query || 
      listing.dog_name.toLowerCase().includes(activeFilters.query.toLowerCase()) ||
      listing.breed.toLowerCase().includes(activeFilters.query.toLowerCase()) ||
      listing.description?.toLowerCase().includes(activeFilters.query.toLowerCase());
    
    return ageInRange && queryMatch;
  });

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <div className="max-w-6xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="p-4 bg-white border-b sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Find Your Perfect Pup</h1>
          {user && (
            <CreateListingDialog onSuccess={() => fetchListings()} />
          )}
        </div>
        
        {/* Enhanced Search */}
        <EnhancedSearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {/* Results */}
      <div className="p-4">
        {loading ? (
          <LoadingSkeleton viewMode="grid" count={6} />
        ) : filteredListings.length === 0 ? (
          <EmptyState 
            onClearFilters={() => handleSearch({
              query: '',
              breed: '',
              location: '',
              minPrice: 0,
              maxPrice: 5000,
              minAge: 0,
              maxAge: 15,
            })}
            hasActiveFilters={
              activeFilters.query !== '' || 
              activeFilters.breed !== '' || 
              activeFilters.location !== '' ||
              activeFilters.minPrice > 0 ||
              activeFilters.maxPrice < 5000 ||
              activeFilters.minAge > 0 ||
              activeFilters.maxAge < 15
            }
          />
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">
                Found {filteredListings.length} {filteredListings.length === 1 ? 'dog' : 'dogs'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isFavorited={user ? isFavorited(listing.id) : false}
                  onFavorite={handleFavorite}
                  onContact={handleContact}
                  onViewDetails={handleViewDetails}
                  showEnhancedActions={true}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;
