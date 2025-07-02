
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Calendar, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ListingFilters from '@/components/listings/ListingFilters';

interface Listing {
  id: string;
  dog_name: string;
  breed: string;
  age: number;
  price: number;
  location: string;
  image_url: string;
  description: string;
  user_id: string;
  created_at: string;
}

const ExploreWithFilters = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Sample data - replace with actual API call
  const sampleListings: Listing[] = [
    {
      id: '1',
      dog_name: 'Buddy',
      breed: 'Golden Retriever',
      age: 12,
      price: 1200,
      location: 'San Francisco, CA',
      image_url: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=300&fit=crop',
      description: 'Beautiful Golden Retriever puppy, well-socialized and ready for a loving home.',
      user_id: 'user1',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      dog_name: 'Luna',
      breed: 'French Bulldog',
      age: 10,
      price: 2500,
      location: 'Los Angeles, CA',
      image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop',
      description: 'Adorable French Bulldog puppy with amazing temperament.',
      user_id: 'user2',
      created_at: '2024-01-14T15:30:00Z'
    },
    {
      id: '3',
      dog_name: 'Max',
      breed: 'Labrador Retriever',
      age: 14,
      price: 1000,
      location: 'Austin, TX',
      image_url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=300&fit=crop',
      description: 'Energetic Lab puppy perfect for active families.',
      user_id: 'user3',
      created_at: '2024-01-13T12:00:00Z'
    }
  ];

  useEffect(() => {
    // Simulate API loading
    setTimeout(() => {
      setListings(sampleListings);
      setFilteredListings(sampleListings);
      setLoading(false);
    }, 1000);
  }, []);

  const handleFiltersChange = (filters: any) => {
    let filtered = [...listings];

    if (filters.breed) {
      filtered = filtered.filter(listing => 
        listing.breed.toLowerCase().includes(filters.breed.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter(listing => 
        listing.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter(listing => 
        listing.price >= filters.priceRange[0] && listing.price <= filters.priceRange[1]
      );
    }

    setFilteredListings(filtered);
  };

  const handleFavorite = (listingId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive"
      });
      return;
    }

    const newFavorites = new Set(favorites);
    if (favorites.has(listingId)) {
      newFavorites.delete(listingId);
    } else {
      newFavorites.add(listingId);
    }
    setFavorites(newFavorites);

    toast({
      title: favorites.has(listingId) ? "Removed from favorites" : "Added to favorites",
      description: "Your favorites have been updated",
    });
  };

  const handleContact = (listingId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to contact breeders",
        variant: "destructive"
      });
      return;
    }
    
    navigate(`/messages?listing=${listingId}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-300 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Find Your Perfect Puppy</h1>
        
        <ListingFilters
          onFiltersChange={handleFiltersChange}
          isOpen={showFilters}
          onToggle={() => setShowFilters(!showFilters)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div 
              className="relative aspect-video overflow-hidden"
              onClick={() => navigate(`/listing/${listing.id}`)}
            >
              <img
                src={listing.image_url}
                alt={listing.dog_name}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavorite(listing.id);
                }}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full"
              >
                <Heart 
                  className={`w-4 h-4 ${
                    favorites.has(listing.id) 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-600'
                  }`} 
                />
              </Button>
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{listing.dog_name}</h3>
                <Badge variant="secondary">{listing.age} weeks</Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{listing.breed}</p>
              
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                {listing.location}
              </div>
              
              <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                {listing.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-blue-600">
                  ${listing.price.toLocaleString()}
                </span>
                
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContact(listing.id);
                  }}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Phone className="w-4 h-4 mr-1" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredListings.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No puppies found</h3>
          <p className="text-gray-600">Try adjusting your filters to see more results.</p>
        </div>
      )}
    </div>
  );
};

export default ExploreWithFilters;
