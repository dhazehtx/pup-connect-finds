
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface MapMarker {
  id: string;
  position: Location;
  title: string;
  description?: string;
  type: 'listing' | 'user' | 'meeting';
}

const InteractiveMap = () => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const { toast } = useToast();

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          toast({
            title: "Location found",
            description: "Your current location has been detected.",
          });
        },
        (error) => {
          toast({
            title: "Location error",
            description: "Unable to get your location. Please enable location services.",
            variant: "destructive",
          });
        }
      );
    }
  };

  // Search for locations
  const searchLocation = async (query: string) => {
    if (!query.trim()) return;

    try {
      // Simulate geocoding API call
      // In production, replace with actual geocoding service
      const mockResults: MapMarker[] = [
        {
          id: '1',
          position: { lat: 37.7749, lng: -122.4194 },
          title: `Golden Retriever Breeder - ${query}`,
          description: 'Verified breeder with excellent reviews',
          type: 'listing'
        },
        {
          id: '2',
          position: { lat: 37.7849, lng: -122.4094 },
          title: `Dog Training Center - ${query}`,
          description: 'Professional training services',
          type: 'listing'
        }
      ];

      setMarkers(mockResults);
      toast({
        title: "Search completed",
        description: `Found ${mockResults.length} results for "${query}"`,
      });
    } catch (error) {
      toast({
        title: "Search error",
        description: "Unable to search locations. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate distance between two points
  const calculateDistance = (point1: Location, point2: Location): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <div className="space-y-6">
      {/* Search and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Interactive Map
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for breeders, locations, or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchLocation(searchQuery)}
            />
            <Button onClick={() => searchLocation(searchQuery)}>
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={getCurrentLocation}>
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Map Placeholder */}
      <Card>
        <CardContent className="p-0">
          <div className="relative w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-4">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-600">Interactive Map View</p>
                <p className="text-sm text-gray-500">
                  {userLocation 
                    ? `Current location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                    : 'Location not detected'
                  }
                </p>
              </div>
              
              {/* Mock map markers */}
              {markers.map((marker) => (
                <div
                  key={marker.id}
                  className="absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    top: `${30 + Math.random() * 40}%`,
                    left: `${20 + Math.random() * 60}%`
                  }}
                  onClick={() => setSelectedMarker(marker)}
                  title={marker.title}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Results */}
      {markers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {markers.map((marker) => (
            <Card 
              key={marker.id} 
              className={`cursor-pointer transition-colors ${
                selectedMarker?.id === marker.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedMarker(marker)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{marker.title}</h3>
                    <p className="text-sm text-gray-600">{marker.description}</p>
                    {userLocation && (
                      <p className="text-xs text-gray-500 mt-1">
                        Distance: {calculateDistance(userLocation, marker.position).toFixed(1)} km
                      </p>
                    )}
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    marker.type === 'listing' ? 'bg-green-500' : 
                    marker.type === 'user' ? 'bg-blue-500' : 'bg-purple-500'
                  }`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Marker Details */}
      {selectedMarker && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedMarker.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{selectedMarker.description}</p>
            <div className="flex gap-2">
              <Button>Get Directions</Button>
              <Button variant="outline">Contact</Button>
              <Button variant="outline">Save Location</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InteractiveMap;
