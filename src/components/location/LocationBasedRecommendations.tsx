
import React, { useState, useEffect } from 'react';
import { MapPin, Star, Heart, TrendingUp } from 'lucide-react';
import { useLocationServices } from '@/hooks/useLocationServices';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import LocationPrompt from './LocationPrompt';
import RecommendationHeader from './RecommendationHeader';
import CurrentLocationDisplay from './CurrentLocationDisplay';
import RecommendationCategory from './RecommendationCategory';

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
    return <LocationPrompt />;
  }

  return (
    <div className="space-y-6">
      <RecommendationHeader loading={loading} onRefresh={generateRecommendations} />
      
      <CurrentLocationDisplay currentLocation={currentLocation} />

      {recommendations.map((category) => (
        <RecommendationCategory key={category.id} category={category} />
      ))}
    </div>
  );
};

export default LocationBasedRecommendations;
