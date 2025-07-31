import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Star, MessageCircle, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface LivePuppyGridProps {
  filters: {
    breeds: string[];
    ageRange: [number, number];
    gender: string;
    location: string;
    priceRange: [number, number];
    sortBy: string;
    verifiedOnly: boolean;
    healthTested: boolean;
    vaccinated: boolean;
    keywords: string;
  };
}

const LivePuppyGrid: React.FC<LivePuppyGridProps> = ({ filters }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Fetch live listings from backend
  const { data: listings = [], isLoading, error } = useQuery({
    queryKey: ['/api/listings', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      // Add filter parameters
      if (filters.breeds.length > 0) {
        queryParams.append('breed', filters.breeds.join(','));
      }
      if (filters.location) {
        queryParams.append('location', filters.location);
      }
      if (filters.priceRange[0] > 0) {
        queryParams.append('minPrice', filters.priceRange[0].toString());
      }
      if (filters.priceRange[1] < 5000) {
        queryParams.append('maxPrice', filters.priceRange[1].toString());
      }
      if (filters.keywords) {
        queryParams.append('search', filters.keywords);
      }
      if (filters.gender !== 'all') {
        queryParams.append('gender', filters.gender);
      }
      if (filters.verifiedOnly) {
        queryParams.append('verified', 'true');
      }

      const response = await fetch(`/api/listings?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      return response.json();
    },
  });

  const handleFavorite = async (listingId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      if (favorites.has(listingId)) {
        // Remove from favorites
        await fetch(`/api/favorites/${user.id}/${listingId}`, {
          method: 'DELETE',
        });
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(listingId);
          return newSet;
        });
      } else {
        // Add to favorites
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            listing_id: listingId,
          }),
        });
        setFavorites(prev => new Set(prev).add(listingId));
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const handleContact = (listing: any) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    // Navigate to messaging with the breeder
    navigate(`/messages?contact=${listing.breeder_id}`);
  };

  const handleViewListing = (listingId: string) => {
    navigate(`/listing/${listingId}`);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Failed to load listings. Please try again.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-100 rounded-full p-6 mx-auto w-24 h-24 flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No puppies match your filters</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or browse our featured listings below.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reset Filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Found <span className="font-semibold">{listings.length}</span> puppies
        </p>
        <select
          value={filters.sortBy}
          className="border rounded-md px-3 py-1 text-sm"
          onChange={(e) => {
            // This would be handled by the parent component
            console.log('Sort changed:', e.target.value);
          }}
        >
          <option value="newest">Newest First</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="verified">Verified Breeders</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing: any) => (
          <Card 
            key={listing.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => handleViewListing(listing.id)}
          >
            <div className="relative">
              <img 
                src={listing.images?.[0] || listing.image_url || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400'} 
                alt={listing.name || `${listing.breed} puppy`}
                className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
              />
              <Button
                size="sm"
                variant="ghost"
                className={`absolute top-2 right-2 bg-white/80 hover:bg-white ${
                  favorites.has(listing.id) ? 'text-red-500' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavorite(listing.id);
                }}
              >
                <Heart className={`h-4 w-4 ${favorites.has(listing.id) ? 'fill-current' : ''}`} />
              </Button>
              {listing.verified && (
                <Badge className="absolute top-2 left-2 bg-green-600 hover:bg-green-700">
                  ✓ Verified
                </Badge>
              )}
              {listing.health_tested && (
                <Badge className="absolute bottom-2 left-2 bg-blue-600 hover:bg-blue-700 text-xs">
                  Health Tested
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                  {listing.name || `${listing.breed} Puppy`}
                </h3>
                <span className="text-lg font-bold text-blue-600">
                  ${listing.price?.toLocaleString() || 'Contact'}
                </span>
              </div>
              <p className="text-gray-600 mb-2">
                {listing.breed} • {listing.age || 'Young'} • {listing.gender || 'Mixed'}
              </p>
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <MapPin className="h-4 w-4 mr-1" />
                {listing.location || 'Location not specified'}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContact(listing);
                  }}
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Message
                </Button>
                {listing.phone && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`tel:${listing.phone}`, '_self');
                    }}
                  >
                    <Phone className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Rating and Reviews */}
              {listing.rating && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">{listing.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {listing.reviews_count || 0} reviews
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {listings.length >= 20 && (
        <div className="text-center pt-6">
          <Button variant="outline" size="lg">
            Load More Puppies
          </Button>
        </div>
      )}
    </div>
  );
};

export default LivePuppyGrid;