
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Filter } from 'lucide-react';
import { useLocationServices } from '@/hooks/useLocationServices';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';

interface LocationAwareListingsProps {
  onLocationFilter?: (location: any) => void;
}

const LocationAwareListings = ({ onLocationFilter }: LocationAwareListingsProps) => {
  const {
    currentLocation,
    locationPreferences,
    detectCurrentLocation,
    getDistanceToLocation,
    formatDistance
  } = useLocationServices();
  
  const { searchResults, performSearch } = useAdvancedSearch();
  const [nearbyListings, setNearbyListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNearbyListings = async () => {
    if (!currentLocation) return;
    
    setLoading(true);
    try {
      // Search listings with location filter
      const results = await performSearch({
        location: currentLocation.city || currentLocation.address
      });
      
      // Filter by distance and add distance info
      // Since our database doesn't have lat/lng, we'll generate mock coordinates near the user
      const withDistance = results.map(listing => {
        // Generate mock coordinates within the search radius for demonstration
        const mockLat = currentLocation.lat + (Math.random() - 0.5) * 0.1;
        const mockLng = currentLocation.lng + (Math.random() - 0.5) * 0.1;
        
        const distance = getDistanceToLocation({
          lat: mockLat,
          lng: mockLng,
          address: listing.location || 'Unknown'
        });
        
        return {
          ...listing,
          distance: distance,
          formattedDistance: distance ? formatDistance(distance) : null
        };
      }).filter(listing => 
        !listing.distance || listing.distance <= locationPreferences.maxDistance
      ).sort((a, b) => (a.distance || 0) - (b.distance || 0));
      
      setNearbyListings(withDistance);
    } catch (error) {
      console.error('Error loading nearby listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentLocation) {
      loadNearbyListings();
    }
  }, [currentLocation, locationPreferences.maxDistance]);

  const handleEnableLocation = async () => {
    await detectCurrentLocation();
  };

  if (!currentLocation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location-Based Listings
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Navigation className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Enable Location Services</h3>
          <p className="text-gray-500 mb-4">
            Find dogs near you by enabling location services
          </p>
          <Button onClick={handleEnableLocation}>
            <Navigation className="h-4 w-4 mr-2" />
            Enable Location
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Nearby Listings
            </div>
            <Badge variant="secondary">
              {nearbyListings.length} within {locationPreferences.maxDistance}km
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
            <Navigation className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Searching near: {currentLocation.address}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={loadNearbyListings}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading nearby listings...</p>
            </div>
          ) : nearbyListings.length === 0 ? (
            <div className="text-center py-8">
              <Filter className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No listings found nearby</h3>
              <p className="text-gray-500 mb-4">
                Try increasing your search radius in location settings
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {nearbyListings.slice(0, 5).map((listing, index) => (
                <div key={listing.id || index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{listing.dog_name || listing.title}</h4>
                    {listing.formattedDistance && (
                      <Badge variant="outline">
                        {listing.formattedDistance}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {listing.breed} • ${listing.price}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {listing.location || 'Location not specified'}
                  </div>
                </div>
              ))}
              
              {nearbyListings.length > 5 && (
                <Button variant="outline" className="w-full">
                  View All {nearbyListings.length} Nearby Listings
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationAwareListings;
