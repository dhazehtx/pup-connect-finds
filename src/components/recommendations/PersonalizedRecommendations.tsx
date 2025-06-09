
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, MapPin, Sparkles, TrendingUp, Clock } from 'lucide-react';
import ListingCard from '@/components/ListingCard';
import { useToast } from '@/hooks/use-toast';

interface Listing {
  id: string;
  dog_name: string;
  breed: string;
  price: number;
  age: number;
  location: string;
  image_url?: string;
  profiles?: {
    verified?: boolean;
    location?: string;
    rating?: number;
    total_reviews?: number;
  };
  status?: string;
}

const PersonalizedRecommendations = () => {
  const [recommendations, setRecommendations] = useState<{
    trending: Listing[];
    nearby: Listing[];
    forYou: Listing[];
  }>({
    trending: [],
    nearby: [],
    forYou: []
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Mock data with proper structure
  const mockListings: Listing[] = [
    {
      id: '1',
      dog_name: 'Bella',
      breed: 'Golden Retriever',
      price: 1200,
      age: 8,
      location: 'San Francisco, CA',
      image_url: '/placeholder.svg',
      profiles: {
        verified: true,
        location: 'San Francisco, CA',
        rating: 4.8,
        total_reviews: 24
      }
    },
    {
      id: '2',
      dog_name: 'Max',
      breed: 'Labrador',
      price: 900,
      age: 12,
      location: 'Oakland, CA',
      image_url: '/placeholder.svg',
      profiles: {
        verified: false,
        location: 'Oakland, CA',
        rating: 4.6,
        total_reviews: 18
      }
    },
    {
      id: '3',
      dog_name: 'Luna',
      breed: 'German Shepherd',
      price: 1500,
      age: 10,
      location: 'Berkeley, CA',
      image_url: '/placeholder.svg',
      profiles: {
        verified: true,
        location: 'Berkeley, CA',
        rating: 4.9,
        total_reviews: 31
      }
    }
  ];

  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRecommendations({
        trending: mockListings.slice(0, 2),
        nearby: mockListings.slice(1, 3),
        forYou: mockListings
      });
      setIsLoading(false);
    };

    loadRecommendations();
  }, []);

  const handleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
    
    toast({
      title: favorites.includes(id) ? "Removed from favorites" : "Added to favorites",
      description: "You can view all favorites in your profile.",
    });
  };

  const handleContact = (id: string) => {
    toast({
      title: "Contact breeder",
      description: "Opening message thread...",
    });
  };

  const handleViewDetails = (id: string) => {
    toast({
      title: "View details",
      description: "Opening listing details...",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8 p-6">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(j => (
                  <div key={j} className="h-64 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Personalized For You */}
      {recommendations.forYou.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Recommended for You
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Based on your preferences and activity
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.forYou.map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isFavorited={favorites.includes(listing.id)}
                  onFavorite={handleFavorite}
                  onContact={handleContact}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trending Now */}
      {recommendations.trending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Trending Now
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Popular listings getting lots of attention
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.trending.map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isFavorited={favorites.includes(listing.id)}
                  onFavorite={handleFavorite}
                  onContact={handleContact}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nearby */}
      {recommendations.nearby.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              Near You
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Dogs available in your area
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.nearby.map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isFavorited={favorites.includes(listing.id)}
                  onFavorite={handleFavorite}
                  onContact={handleContact}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PersonalizedRecommendations;
