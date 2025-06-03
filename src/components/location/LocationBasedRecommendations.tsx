
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Heart, TrendingUp, Users } from 'lucide-react';
import { useLocationServices } from '@/hooks/useLocationServices';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';

interface RecommendationCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  listings: any[];
}

const LocationBasedRecommendations = () => {
  const {
    currentLocation,
    getDistanceToLocation,
    formatDistance
  } = useLocationServices();
  
  const { performSearch } = useAdvancedSearch();
  
  const [recommendations, setRecommendations] = useState<RecommendationCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const generateRecommendations = async () => {
    if (!currentLocation) return;
    
    setLoading(true);
    try {
      // Get all listings and process them for recommendations
      const allListings = await performSearch({});
      
      // Add mock location data and distance calculations
      const listingsWithLocation = allListings.map(listing => {
        const mockLat = currentLocation.lat + (Math.random() - 0.5) * 0.2;
        const mockLng = currentLocation.lng + (Math.random() - 0.5) * 0.2;
        
        const distance = getDistanceToLocation({
          lat: mockLat,
          lng: mockLng,
          address: listing.location || 'Unknown'
        });
        
        return {
          ...listing,
          lat: mockLat,
          lng: mockLng,
          distance,
          formattedDistance: distance ? formatDistance(distance) : null,
          // Mock additional data for recommendations
          rating: Math.random() * 5,
          reviews: Math.floor(Math.random() * 50),
          views: Math.floor(Math.random() * 1000),
          favorites: Math.floor(Math.random() * 100)
        };
      });

      // Create recommendation categories
      const categories: RecommendationCategory[] = [
        {
          id: 'nearby',
          title: 'Closest to You',
          description: 'Puppies within easy reach',
          icon: <MapPin className="h-4 w-4" />,
          listings: listingsWithLocation
            .filter(l => l.distance && l.distance <= 15)
            .sort((a, b) => (a.distance || 0) - (b.distance || 0))
            .slice(0, 4)
        },
        {
          id: 'popular',
          title: 'Popular in Your Area',
          description: 'Most viewed listings nearby',
          icon: <TrendingUp className="h-4 w-4" />,
          listings: listingsWithLocation
            .filter(l => l.distance && l.distance <= 50)
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 4)
        },
        {
          id: 'top-rated',
          title: 'Top Rated Breeders',
          description: 'Highly rated sellers near you',
          icon: <Star className="h-4 w-4" />,
          listings: listingsWithLocation
            .filter(l => l.distance && l.distance <= 75)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 4)
        },
        {
          id: 'favorites',
          title: 'Community Favorites',
          description: 'Most favorited in your region',
          icon: <Heart className="h-4 w-4" />,
          listings: listingsWithLocation
            .filter(l => l.distance && l.distance <= 100)
            .sort((a, b) => (b.favorites || 0) - (a.favorites || 0))
            .slice(0, 4)
        }
      ];

      setRecommendations(categories.filter(cat => cat.listings.length > 0));
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentLocation) {
      generateRecommendations();
    }
  }, [currentLocation]);

  if (!currentLocation) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Enable Location for Recommendations</h3>
          <p className="text-gray-500">
            Allow location access to see personalized recommendations based on your area
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Location-Based Recommendations</h2>
          <p className="text-gray-600">Personalized suggestions based on your location</p>
        </div>
        <Button onClick={generateRecommendations} disabled={loading} variant="outline">
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Current Location Display */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span className="font-medium">Searching from:</span>
            <span>{currentLocation.address}</span>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Categories */}
      {recommendations.map((category) => (
        <Card key={category.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {category.icon}
              <div>
                <span>{category.title}</span>
                <p className="text-sm font-normal text-gray-600">{category.description}</p>
              </div>
              <Badge variant="secondary" className="ml-auto">
                {category.listings.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.listings.map((listing, index) => (
                <div key={listing.id || index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-3">
                    <img
                      src={listing.image_url || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop'}
                      alt={listing.dog_name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{listing.dog_name}</h4>
                      <p className="text-sm text-gray-600">{listing.breed}</p>
                      <p className="text-lg font-bold">${listing.price?.toLocaleString()}</p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {listing.formattedDistance && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {listing.formattedDistance}
                          </span>
                        )}
                        
                        {category.id === 'top-rated' && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {listing.rating?.toFixed(1)}
                          </span>
                        )}
                        
                        {category.id === 'popular' && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {listing.views} views
                          </span>
                        )}
                        
                        {category.id === 'favorites' && (
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {listing.favorites} ❤️
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1">Contact</Button>
                    <Button size="sm" variant="outline" className="flex-1">Details</Button>
                  </div>
                </div>
              ))}
            </div>
            
            {category.listings.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No listings found in this category
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LocationBasedRecommendations;
