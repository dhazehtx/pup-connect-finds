
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Search } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/use-toast';

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  type: 'listing' | 'user' | 'breeder';
}

interface InteractiveMapProps {
  markers?: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerClick?: (marker: MapMarker) => void;
  showUserLocation?: boolean;
}

const InteractiveMap = ({ 
  markers = [], 
  center = { lat: 40.7128, lng: -74.0060 }, // Default to NYC
  zoom = 10,
  onMarkerClick,
  showUserLocation = true 
}: InteractiveMapProps) => {
  const [mapCenter, setMapCenter] = useState(center);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { position, getCurrentLocation, loading: locationLoading } = useGeolocation();
  const { toast } = useToast();

  // Update map center when user location is available
  useEffect(() => {
    if (position && showUserLocation) {
      setMapCenter({
        lat: position.latitude,
        lng: position.longitude
      });
    }
  }, [position, showUserLocation]);

  const handleGetLocation = async () => {
    try {
      await getCurrentLocation();
      toast({
        title: "Location found",
        description: "Map centered on your location",
      });
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
    onMarkerClick?.(marker);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // In a real implementation, this would geocode the search query
      toast({
        title: "Search functionality",
        description: "Map search would be implemented with a geocoding service",
      });
    }
  };

  // Mock map implementation - in production this would use Google Maps, Mapbox, etc.
  const mockMapStyle = {
    width: '100%',
    height: '400px',
    backgroundColor: '#e5e7eb',
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    position: 'relative' as const,
    overflow: 'hidden'
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Interactive Map
        </CardTitle>
        
        {/* Search Bar */}
        <div className="flex gap-2 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} variant="outline">
            Search
          </Button>
          <Button 
            onClick={handleGetLocation} 
            disabled={locationLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            {locationLoading ? 'Locating...' : 'My Location'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Mock Map Display */}
        <div style={mockMapStyle} className="flex items-center justify-center">
          <div className="text-center text-gray-600">
            <MapPin className="h-12 w-12 mx-auto mb-2 text-blue-500" />
            <p className="text-lg font-medium">Interactive Map View</p>
            <p className="text-sm">
              Center: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
            </p>
            <p className="text-sm mt-2">
              {markers.length} marker{markers.length !== 1 ? 's' : ''} available
            </p>
            
            {/* Mock markers visualization */}
            <div className="mt-4 space-y-2">
              {markers.slice(0, 3).map((marker) => (
                <div 
                  key={marker.id}
                  className="bg-white p-2 rounded shadow-sm border cursor-pointer hover:bg-gray-50"
                  onClick={() => handleMarkerClick(marker)}
                >
                  <div className="text-sm font-medium">{marker.title}</div>
                  <div className="text-xs text-gray-500">
                    {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                  </div>
                </div>
              ))}
              {markers.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{markers.length - 3} more markers
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Marker Info */}
        {selectedMarker && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-medium text-blue-900">{selectedMarker.title}</h4>
            {selectedMarker.description && (
              <p className="text-sm text-blue-700 mt-1">{selectedMarker.description}</p>
            )}
            <div className="text-xs text-blue-600 mt-2">
              Type: {selectedMarker.type} | 
              Location: {selectedMarker.lat.toFixed(4)}, {selectedMarker.lng.toFixed(4)}
            </div>
          </div>
        )}

        {/* User Location Display */}
        {position && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-800">
              <Navigation className="h-4 w-4" />
              <span className="font-medium">Your Location</span>
            </div>
            <div className="text-sm text-green-700 mt-1">
              {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
            </div>
            <div className="text-xs text-green-600">
              Accuracy: ±{Math.round(position.accuracy)}m
            </div>
          </div>
        )}

        {/* Integration Note */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This is a mock map implementation. 
            In production, integrate with Google Maps, Mapbox, or OpenStreetMap for full functionality.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveMap;
