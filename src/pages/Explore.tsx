
import React, { useState, useEffect } from 'react';
import { Search, Filter, Heart, MapPin, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDogListings } from '@/hooks/useDogListings';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Explore = () => {
  const { listings, loading, fetchListings } = useDogListings();
  const { createConversation } = useMessaging();
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    breed: '',
    minPrice: '',
    maxPrice: '',
    location: '',
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const filteredListings = listings.filter(listing => {
    const matchesSearch = 
      listing.dog_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.breed.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBreed = !filters.breed || 
      listing.breed.toLowerCase().includes(filters.breed.toLowerCase());
    
    const matchesLocation = !filters.location || 
      (listing.location && listing.location.toLowerCase().includes(filters.location.toLowerCase()));
    
    const matchesMinPrice = !filters.minPrice || listing.price >= Number(filters.minPrice);
    const matchesMaxPrice = !filters.maxPrice || listing.price <= Number(filters.maxPrice);

    return matchesSearch && matchesBreed && matchesLocation && matchesMinPrice && matchesMaxPrice;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleContactSeller = async (listing: any) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to contact sellers",
        variant: "destructive",
      });
      return;
    }

    if (user.id === listing.user_id) {
      toast({
        title: "Cannot contact yourself",
        description: "You cannot start a conversation with yourself",
        variant: "destructive",
      });
      return;
    }

    try {
      const conversationId = await createConversation(listing.id, listing.user_id);
      if (conversationId) {
        toast({
          title: "Conversation started",
          description: "You can now message the seller in your Messages",
        });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Dogs</h1>
        <p className="text-gray-600">Find your perfect companion from verified breeders</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or breed..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Input
            placeholder="Breed"
            value={filters.breed}
            onChange={(e) => setFilters({ ...filters, breed: e.target.value })}
          />
          
          <Input
            placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          />
          
          <div className="flex gap-2">
            <Input
              placeholder="Min $"
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="w-1/2"
            />
            <Input
              placeholder="Max $"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="w-1/2"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listings...</p>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No dogs found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Found {filteredListings.length} dog{filteredListings.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {listing.image_url && (
                  <div className="aspect-square w-full bg-gray-100 relative">
                    <img
                      src={listing.image_url}
                      alt={listing.dog_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                )}
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{listing.dog_name}</h3>
                      <p className="text-gray-600">{listing.breed}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-green-600">
                        {formatPrice(listing.price)}
                      </span>
                      <Badge variant="secondary">
                        {listing.age} months
                      </Badge>
                    </div>

                    {listing.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-3 h-3 mr-1" />
                        {listing.location}
                      </div>
                    )}

                    {listing.profiles && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          by {listing.profiles.full_name || listing.profiles.username}
                        </span>
                        {listing.profiles.verified && (
                          <Badge variant="outline" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button className="flex-1" size="sm">
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleContactSeller(listing)}
                        disabled={!user || user.id === listing.user_id}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Explore;
