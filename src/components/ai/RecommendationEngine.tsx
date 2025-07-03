import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Star, MapPin, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDogListings } from '@/hooks/useDogListings';

interface Recommendation {
  listing: any;
  score: number;
  reasons: string[];
  type: 'breed_match' | 'location_match' | 'price_match' | 'size_match' | 'trending';
}

const RecommendationEngine = () => {
  const { user } = useAuth();
  const { listings } = useDogListings();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  // User preferences (in real app, this would come from user profile)
  const userPreferences = {
    preferredBreeds: ['Golden Retriever', 'Labrador Retriever', 'Poodle'],
    maxPrice: 3000,
    preferredSize: 'Medium',
    location: 'San Francisco, CA',
    maxDistance: 50
  };

  useEffect(() => {
    generateRecommendations();
  }, [listings]);

  const generateRecommendations = () => {
    if (!listings.length) {
      setLoading(false);
      return;
    }

    const scored = listings.map(listing => {
      let score = 0;
      const reasons: string[] = [];

      // Breed matching
      if (userPreferences.preferredBreeds.some(breed => 
        listing.breed.toLowerCase().includes(breed.toLowerCase())
      )) {
        score += 40;
        reasons.push('Matches your preferred breeds');
      }

      // Price matching
      if (listing.price <= userPreferences.maxPrice) {
        score += 30;
        reasons.push('Within your budget');
      }

      // Location proximity (simulated)
      if (listing.location && Math.random() > 0.5) {
        score += 25;
        reasons.push('Close to your location');
      }

      // Age preference (younger dogs get higher scores)
      if (listing.age <= 6) {
        score += 20;
        reasons.push('Young puppy');
      }

      // Verified seller bonus - check if listing has verified seller info
      if (listing.verified || (listing.seller && listing.seller.verified)) {
        score += 15;
        reasons.push('Verified seller');
      }

      // Random factor for diversity
      score += Math.random() * 10;

      const type = determineRecommendationType(listing, reasons);

      return {
        listing,
        score,
        reasons,
        type
      };
    });

    // Sort by score and take top 6
    const topRecommendations = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    setRecommendations(topRecommendations);
    setLoading(false);
  };

  const determineRecommendationType = (listing: any, reasons: string[]): Recommendation['type'] => {
    if (reasons.includes('Matches your preferred breeds')) return 'breed_match';
    if (reasons.includes('Close to your location')) return 'location_match';
    if (reasons.includes('Within your budget')) return 'price_match';
    if (listing.age <= 3) return 'trending';
    return 'breed_match';
  };

  const getRecommendationTypeLabel = (type: Recommendation['type']) => {
    switch (type) {
      case 'breed_match': return 'Perfect Breed Match';
      case 'location_match': return 'Near You';
      case 'price_match': return 'Great Value';
      case 'size_match': return 'Perfect Size';
      case 'trending': return 'Trending Now';
    }
  };

  const getRecommendationColor = (type: Recommendation['type']) => {
    switch (type) {
      case 'breed_match': return 'bg-blue-100 text-blue-800';
      case 'location_match': return 'bg-green-100 text-green-800';
      case 'price_match': return 'bg-purple-100 text-purple-800';
      case 'size_match': return 'bg-orange-100 text-orange-800';
      case 'trending': return 'bg-red-100 text-red-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recommendations yet</h3>
            <p className="text-gray-600">
              Complete your profile to get personalized recommendations!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Recommended for You
        </CardTitle>
        <p className="text-sm text-gray-600">
          Based on your preferences and activity
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, index) => (
            <Card key={rec.listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                {rec.listing.image_url && (
                  <div className="aspect-square w-full bg-gray-100">
                    <img
                      src={rec.listing.image_url}
                      alt={rec.listing.dog_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Recommendation badge */}
                <div className="absolute top-2 left-2">
                  <Badge className={getRecommendationColor(rec.type)}>
                    {getRecommendationTypeLabel(rec.type)}
                  </Badge>
                </div>

                {/* Match score */}
                <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-medium">
                  {Math.round(rec.score)}% match
                </div>

                {/* Favorite button */}
                <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{rec.listing.dog_name}</h3>
                    <p className="text-gray-600">{rec.listing.breed}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-green-600">
                      {formatPrice(rec.listing.price)}
                    </span>
                    <Badge variant="secondary">
                      {rec.listing.age} months
                    </Badge>
                  </div>

                  {rec.listing.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-3 h-3 mr-1" />
                      {rec.listing.location}
                    </div>
                  )}

                  {/* Recommendation reasons */}
                  <div className="space-y-1">
                    {rec.reasons.slice(0, 2).map((reason, idx) => (
                      <p key={idx} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        • {reason}
                      </p>
                    ))}
                  </div>

                  <Button className="w-full" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Button variant="outline" onClick={generateRecommendations}>
            <Star className="w-4 h-4 mr-2" />
            Refresh Recommendations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationEngine;
