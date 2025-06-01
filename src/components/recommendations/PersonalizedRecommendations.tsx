
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Eye, TrendingUp, MapPin, Clock } from 'lucide-react';
import ListingCard from '@/components/ListingCard';
import { sampleListings } from '@/data/sampleListings';

const PersonalizedRecommendations = () => {
  const [viewingHistory, setViewingHistory] = useState([
    { listingId: 1, breed: 'Golden Retriever', viewedAt: new Date(), timeSpent: 45 },
    { listingId: 3, breed: 'French Bulldog', viewedAt: new Date(), timeSpent: 30 },
    { listingId: 5, breed: 'German Shepherd', viewedAt: new Date(), timeSpent: 60 }
  ]);

  const [preferences, setPreferences] = useState({
    preferredBreeds: ['Golden Retriever', 'French Bulldog', 'German Shepherd'],
    priceRange: [1000, 4000],
    location: 'Los Angeles',
    agePreference: 'puppy'
  });

  // Simulate AI-powered recommendations based on viewing history
  const generateRecommendations = () => {
    const viewedBreeds = viewingHistory.map(item => item.breed);
    const recommendations = sampleListings.filter(listing => 
      viewedBreeds.some(breed => listing.breed.includes(breed)) ||
      preferences.preferredBreeds.some(breed => listing.breed.includes(breed))
    ).slice(0, 6);

    return recommendations;
  };

  const getSimilarListings = (currentListing: any) => {
    return sampleListings.filter(listing => 
      listing.breed === currentListing.breed && 
      listing.id !== currentListing.id
    ).slice(0, 4);
  };

  const getTrendingBreeds = () => {
    const breedCounts = sampleListings.reduce((acc, listing) => {
      acc[listing.breed] = (acc[listing.breed] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(breedCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([breed, count]) => ({ breed, count }));
  };

  const recommendations = generateRecommendations();
  const trendingBreeds = getTrendingBreeds();
  const recentlyViewed = viewingHistory.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Personalized for You</h1>
        <p className="text-gray-600">Discover puppies tailored to your preferences and browsing history</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="text-red-500" size={20} />
              <div>
                <p className="text-sm text-gray-600">Saved Favorites</p>
                <p className="text-xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="text-blue-500" size={20} />
              <div>
                <p className="text-sm text-gray-600">Recently Viewed</p>
                <p className="text-xl font-bold">{viewingHistory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-green-500" size={20} />
              <div>
                <p className="text-sm text-gray-600">New Matches</p>
                <p className="text-xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="text-purple-500" size={20} />
              <div>
                <p className="text-sm text-gray-600">Nearby Listings</p>
                <p className="text-xl font-bold">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recommended for You</h2>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            AI Powered
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map(listing => (
            <ListingCard
              key={listing.id}
              {...listing}
              isFavorited={false}
              onFavorite={() => {}}
              onContact={() => {}}
              onViewDetails={() => {}}
            />
          ))}
        </div>
      </section>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Recently Viewed</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentlyViewed.map(item => {
              const listing = sampleListings.find(l => l.id === item.listingId);
              if (!listing) return null;
              
              return (
                <Card key={item.listingId}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={listing.image} 
                        alt={listing.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{listing.title}</h4>
                        <p className="text-sm text-gray-600">{listing.breed}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={12} />
                          <span>{item.timeSpent}s viewed</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Trending Breeds */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Trending in Your Area</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {trendingBreeds.map((item, index) => (
            <Card key={item.breed} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full mx-auto mb-3 text-xl font-bold">
                  {index + 1}
                </div>
                <h4 className="font-medium mb-1">{item.breed}</h4>
                <p className="text-sm text-gray-600">{item.count} listings</p>
                <Badge variant="secondary" className="mt-2">
                  Trending
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Similar to Your Favorites */}
      {preferences.preferredBreeds.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">More Like Your Favorites</h2>
          <div className="space-y-6">
            {preferences.preferredBreeds.slice(0, 2).map(breed => {
              const breedListings = sampleListings.filter(listing => 
                listing.breed.includes(breed)
              ).slice(0, 3);
              
              return (
                <div key={breed}>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    {breed}
                    <Badge variant="outline">{breedListings.length} available</Badge>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {breedListings.map(listing => (
                      <ListingCard
                        key={listing.id}
                        {...listing}
                        isFavorited={false}
                        onFavorite={() => {}}
                        onContact={() => {}}
                        onViewDetails={() => {}}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Not seeing what you're looking for?</h3>
          <p className="text-gray-600 mb-6">
            Set up search alerts and we'll notify you when new puppies matching your criteria become available.
          </p>
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Create Search Alert
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizedRecommendations;
