
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, MapPin, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Listing {
  id: string;
  dog_name: string;
  breed: string;
  price: number;
  age: number;
  location: string;
  image_url?: string;
  rating?: number;
  distance?: string;
}

interface EnhancedRecommendationsProps {
  userPreferences?: {
    favoriteBreeds: string[];
    priceRange: [number, number];
    maxDistance: number;
    agePreference: string;
  };
  userHistory?: {
    viewedListings: string[];
    favoriteListings: string[];
    searches: string[];
  };
  onListingClick: (listing: Listing) => void;
  onFavorite: (listingId: string) => void;
}

const EnhancedRecommendations = ({ 
  userPreferences, 
  userHistory, 
  onListingClick, 
  onFavorite 
}: EnhancedRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<{
    personalized: Listing[];
    trending: Listing[];
    nearby: Listing[];
    similar: Listing[];
  }>({
    personalized: [],
    trending: [],
    nearby: [],
    similar: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Mock recommendation data
  const mockListings: Listing[] = [
    {
      id: '1',
      dog_name: 'Bella',
      breed: 'Golden Retriever',
      price: 1200,
      age: 8,
      location: 'San Francisco, CA',
      image_url: '/placeholder.svg',
      rating: 4.8,
      distance: '2.3 miles'
    },
    {
      id: '2',
      dog_name: 'Max',
      breed: 'Labrador',
      price: 900,
      age: 12,
      location: 'Oakland, CA',
      image_url: '/placeholder.svg',
      rating: 4.6,
      distance: '5.1 miles'
    },
    {
      id: '3',
      dog_name: 'Luna',
      breed: 'German Shepherd',
      price: 1500,
      age: 10,
      location: 'Berkeley, CA',
      image_url: '/placeholder.svg',
      rating: 4.9,
      distance: '7.8 miles'
    }
  ];

  useEffect(() => {
    // Simulate AI-powered recommendation generation
    const generateRecommendations = async () => {
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setRecommendations({
        personalized: mockListings.slice(0, 3),
        trending: mockListings.slice(1, 4),
        nearby: mockListings.slice(0, 2),
        similar: mockListings.slice(2, 4)
      });
      
      setIsLoading(false);
    };

    generateRecommendations();
  }, [userPreferences, userHistory]);

  const RecommendationCard = ({ listing, reason }: { listing: Listing; reason: string }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onListingClick(listing)}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {listing.image_url && (
            <img 
              src={listing.image_url} 
              alt={listing.dog_name}
              className="w-20 h-20 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold">{listing.dog_name}</h3>
                <p className="text-sm text-gray-600">{listing.breed}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite(listing.id);
                }}
                className="p-1"
              >
                <Heart className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">${listing.price}</Badge>
              {listing.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs">{listing.rating}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{listing.distance}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{listing.age} months</span>
              </div>
            </div>
            
            <Badge variant="outline" className="mt-2 text-xs">
              {reason}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2].map(j => (
                  <div key={j} className="h-20 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personalized Recommendations */}
      {recommendations.personalized.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Recommended for You
            </CardTitle>
            <p className="text-sm text-gray-600">
              Based on your preferences and browsing history
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.personalized.map(listing => (
              <RecommendationCard 
                key={listing.id} 
                listing={listing} 
                reason="Matches your preferences"
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Nearby Listings */}
      {recommendations.nearby.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              Near You
            </CardTitle>
            <p className="text-sm text-gray-600">
              Dogs available in your area
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.nearby.map(listing => (
              <RecommendationCard 
                key={listing.id} 
                listing={listing} 
                reason="Close to you"
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Trending Now */}
      {recommendations.trending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" />
              Trending Now
            </CardTitle>
            <p className="text-sm text-gray-600">
              Popular listings getting attention
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.trending.map(listing => (
              <RecommendationCard 
                key={listing.id} 
                listing={listing} 
                reason="Trending"
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Similar to Viewed */}
      {recommendations.similar.length > 0 && userHistory?.viewedListings?.length && (
        <Card>
          <CardHeader>
            <CardTitle>Similar to What You've Viewed</CardTitle>
            <p className="text-sm text-gray-600">
              Dogs similar to ones you've shown interest in
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.similar.map(listing => (
              <RecommendationCard 
                key={listing.id} 
                listing={listing} 
                reason="Similar to viewed"
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedRecommendations;
