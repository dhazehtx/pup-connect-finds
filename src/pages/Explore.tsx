
import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Heart, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useDogListings } from '@/hooks/useDogListings';
import { useFavorites } from '@/hooks/useFavorites';
import { useMessaging } from '@/hooks/useMessaging';
import ListingCard from '@/components/ListingCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    breed: '',
    minPrice: '',
    maxPrice: '',
    location: ''
  });
  const { user } = useAuth();
  const { listings, loading, fetchListings } = useDogListings();
  const { toggleFavorite, isFavorited } = useFavorites();
  const { createConversation } = useMessaging();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSearch = () => {
    const searchFilters = {
      ...filters,
      breed: searchQuery || filters.breed
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

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="p-4 bg-white border-b sticky top-0 z-10">
        <h1 className="text-xl font-bold mb-4">Find Your Perfect Pup</h1>
        
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search breeds, names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} size="sm">
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 mt-3 overflow-x-auto">
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            <Filter className="w-3 h-3 mr-1" />
            Filters
          </Button>
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            <MapPin className="w-3 h-3 mr-1" />
            Near me
          </Button>
        </div>
      </div>

      {/* Listings */}
      <div className="p-4">
        {loading ? (
          <LoadingSkeleton viewMode="grid" count={6} />
        ) : listings.length === 0 ? (
          <EmptyState 
            onClearFilters={() => {
              setSearchQuery('');
              setFilters({ breed: '', minPrice: '', maxPrice: '', location: '' });
              fetchListings();
            }}
            hasActiveFilters={searchQuery !== '' || Object.values(filters).some(f => f !== '')}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isFavorited={isFavorited(listing.id)}
                onFavorite={handleFavorite}
                onContact={handleContact}
                onViewDetails={handleViewDetails}
                showEnhancedActions={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
