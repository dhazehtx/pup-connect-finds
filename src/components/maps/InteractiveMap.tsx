
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Search, Layers } from 'lucide-react';
import { useLocationServices } from '@/hooks/useLocationServices';
import { useToast } from '@/hooks/use-toast';

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  type: 'listing' | 'user' | 'breeder';
  distance?: number;
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
  center,
  zoom = 10,
  onMarkerClick,
  showUserLocation = true 
}: InteractiveMapProps) => {
  const {
    currentLocation,
    locationPreferences,
    detectCurrentLocation,
    getDistanceToLocation,
    formatDistance
  } = useLocationServices();
  
  const [mapCenter, setMapCenter] = useState(center || { lat: 40.7128, lng: -74.0060 });
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapView, setMapView] = useState<'standard' | 'satellite' | 'terrain'>('standard');
  const { toast } = useToast();

  // Update map center when user location is available
  useEffect(() => {
    if (currentLocation && showUserLocation && !center) {
      setMapCenter({
        lat: currentLocation.lat,
        lng: currentLocation.lng
      });
    }
  }, [currentLocation, showUserLocation, center]);

  // Add distance information to markers
  const markersWithDistance = markers.map(marker => ({
    ...marker,
    distance: currentLocation ? getDistanceToLocation({
      lat: marker.lat,
      lng: marker.lng,
      address: marker.title
    }) : undefined
  })).filter(marker => 
    !currentLocation || 
    !marker.distance || 
    marker.distance <= locationPreferences.maxDistance
  ).sort((a, b) => (a.distance || 0) - (b.distance || 0));

  const handleGetLocation = async () => {
    try {
      await detectCurrentLocation();
      toast({
        title: "Location updated",
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
      toast({
        title: "Search functionality",
        description: "Map search would be implemented with a geocoding service",
      });
    }
  };

  const getMapViewStyle = () => {
    switch (mapView) {
      case 'satellite':
        return 'bg-green-100';
      case 'terrain':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Interactive Map
          </div>
          <div className="flex items-center gap-2">
            <select
              value={mapView}
              onChange={(e) => setMapView(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="standard">Standard</option>
              <option value="satellite">Satellite</option>
              <option value="terrain">Terrain</option>
            </select>
            <Layers className="h-4 w-4 text-gray-500" />
          </div>
        </CardTitle>
        
        {/* Map Controls */}
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
            variant="outline"
            className="flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            My Location
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Mock Map Display */}
        <div 
          className={`w-full h-96 ${getMapViewStyle()} rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden`}
        >
          <div className="text-center text-gray-600 z-10">
            <MapPin className="h-12 w-12 mx-auto mb-2 text-blue-500" />
            <p className="text-lg font-medium">Interactive Map View</p>
            <p className="text-sm">
              Center: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
            </p>
            <p className="text-sm mt-1">
              View: {mapView} • Zoom: {zoom}
            </p>
            <p className="text-sm mt-2">
              {markersWithDistance.length} marker{markersWithDistance.length !== 1 ? 's' : ''} 
              {currentLocation && ` within ${locationPreferences.maxDistance}km`}
            </p>
          </div>

          {/* Mock markers visualization */}
          <div className="absolute inset-4 pointer-events-none">
            {markersWithDistance.slice(0, 8).map((marker, index) => (
              <div
                key={marker.id}
                className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow cursor-pointer"
                style={{
                  left: `${20 + (index % 4) * 20}%`,
                  top: `${20 + Math.floor(index / 4) * 25}%`,
                }}
                onClick={() => handleMarkerClick(marker)}
              />
            ))}
            
            {/* User location marker */}
            {currentLocation && showUserLocation && (
              <div
                className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow animate-pulse"
                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
              />
            )}
          </div>
        </div>

        {/* Markers List */}
        {markersWithDistance.length > 0 && (
          <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
            <h4 className="font-medium text-sm">Nearby Markers</h4>
            {markersWithDistance.slice(0, 5).map((marker) => (
              <div 
                key={marker.id}
                className="bg-white p-3 rounded border shadow-sm cursor-pointer hover:bg-gray-50"
                onClick={() => handleMarkerClick(marker)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium">{marker.title}</div>
                    {marker.description && (
                      <div className="text-xs text-gray-500 mt-1">{marker.description}</div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {marker.type}
                    </div>
                    {marker.distance && (
                      <div className="text-xs text-blue-600 mt-1">
                        {formatDistance(marker.distance)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {markersWithDistance.length > 5 && (
              <div className="text-xs text-gray-500 text-center">
                +{markersWithDistance.length - 5} more markers
              </div>
            )}
          </div>
        )}

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
              {selectedMarker.distance && ` | Distance: ${formatDistance(selectedMarker.distance)}`}
            </div>
          </div>
        )}

        {/* User Location Display */}
        {currentLocation && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-800">
              <Navigation className="h-4 w-4" />
              <span className="font-medium">Your Location</span>
            </div>
            <div className="text-sm text-green-700 mt-1">
              {currentLocation.address}
            </div>
            <div className="text-xs text-green-600">
              {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </div>
          </div>
        )}

        {/* Integration Note */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Enhanced Location Services:</strong> This map now integrates with GPS location detection, 
            distance filtering, and location preferences. For full functionality, integrate with Google Maps, 
            Mapbox, or OpenStreetMap.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveMap;
