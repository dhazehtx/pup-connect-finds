
import React, { useState, useEffect } from 'react';
import { Search, Filter, Heart, MapPin, MessageCircle, Sliders } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDogListings } from '@/hooks/useDogListings';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';

const Explore = () => {
  const { listings, loading, fetchListings } = useDogListings();
  const { createConversation } = useMessaging();
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchListings();
  }, []);

  const applyAdvancedFilters = (filters: any) => {
    setAppliedFilters(filters);
    setShowAdvancedSearch(false);
  };

  const filteredListings = listings.filter(listing => {
    // Basic search filter
    const matchesSearch = 
      listing.dog_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.breed.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    // Advanced filters
    if (appliedFilters) {
      if (appliedFilters.breed && !listing.breed.toLowerCase().includes(appliedFilters.breed.toLowerCase())) {
        return false;
      }
      
      if (appliedFilters.location && listing.location && 
          !listing.location.toLowerCase().includes(appliedFilters.location.toLowerCase())) {
        return false;
      }
      
      if (listing.price < appliedFilters.priceRange[0] || listing.price > appliedFilters.priceRange[1]) {
        return false;
      }
      
      if (listing.age < appliedFilters.ageRange[0] || listing.age > appliedFilters.ageRange[1]) {
        return false;
      }

      if (appliedFilters.verified && !listing.profiles?.verified) {
        return false;
      }
    }

    return true;
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

  const toggleFavorite = (listingId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(listingId)) {
        newFavorites.delete(listingId);
        toast({
          title: "Removed from favorites",
          description: "Dog removed from your favorites list",
        });
      } else {
        newFavorites.add(listingId);
        toast({
          title: "Added to favorites",
          description: "Dog added to your favorites list",
        });
      }
      return newFavorites;
    });
  };

  const clearFilters = () => {
    setAppliedFilters(null);
    setSearchTerm('');
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
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
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
          
          <div className="flex gap-2">
            <Dialog open={showAdvancedSearch} onOpenChange={setShowAdvancedSearch}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Sliders className="w-4 h-4 mr-2" />
                  Advanced Search
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <AdvancedSearch 
                  onSearch={applyAdvancedFilters}
                  onClose={() => setShowAdvancedSearch(false)}
                />
              </DialogContent>
            </Dialog>
            
            {appliedFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {appliedFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {appliedFilters.breed && (
              <Badge variant="secondary">
                Breed: {appliedFilters.breed}
              </Badge>
            )}
            {appliedFilters.location && (
              <Badge variant="secondary">
                Location: {appliedFilters.location}
              </Badge>
            )}
            <Badge variant="secondary">
              Price: ${appliedFilters.priceRange[0]} - ${appliedFilters.priceRange[1]}
            </Badge>
            <Badge variant="secondary">
              Age: {appliedFilters.ageRange[0]} - {appliedFilters.ageRange[1]} months
            </Badge>
            {appliedFilters.verified && (
              <Badge variant="secondary">
                Verified Only
              </Badge>
            )}
          </div>
        )}
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
          {appliedFilters && (
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Clear Filters
            </Button>
          )}
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
                    <button 
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                      onClick={() => toggleFavorite(listing.id)}
                    >
                      <Heart 
                        className={`w-4 h-4 ${
                          favorites.has(listing.id) 
                            ? 'text-red-500 fill-current' 
                            : 'text-gray-600'
                        }`} 
                      />
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
