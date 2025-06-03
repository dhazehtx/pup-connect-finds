
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Search, Layers, ZoomIn, ZoomOut } from 'lucide-react';
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
  className?: string;
}

const InteractiveMap = ({ 
  markers = [], 
  center,
  zoom = 10,
  onMarkerClick,
  showUserLocation = true,
  className = ""
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
  const [mapZoom, setMapZoom] = useState(zoom);
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

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'listing':
        return 'bg-red-500';
      case 'breeder':
        return 'bg-green-500';
      case 'user':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className={`w-full ${className}`}>
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
          <Button 
            onClick={handleGetLocation}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            My Location
          </Button>
          
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMapZoom(prev => Math.min(prev + 1, 20))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMapZoom(prev => Math.max(prev - 1, 1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Enhanced Map Display */}
        <div 
          className={`w-full h-96 ${getMapViewStyle()} rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden`}
        >
          {/* Map Info Overlay */}
          <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded px-3 py-2 text-sm z-20">
            <div className="font-medium">
              Center: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
            </div>
            <div className="text-gray-600">
              Zoom: {mapZoom} • View: {mapView}
            </div>
            <div className="text-blue-600">
              {markersWithDistance.length} marker{markersWithDistance.length !== 1 ? 's' : ''} 
              {currentLocation && ` within ${locationPreferences.maxDistance}km`}
            </div>
          </div>

          {/* Center Message */}
          <div className="text-center text-gray-600 z-10">
            <MapPin className="h-12 w-12 mx-auto mb-2 text-blue-500" />
            <p className="text-lg font-medium">Enhanced Interactive Map</p>
            <p className="text-sm">Showing listings with location filtering</p>
          </div>

          {/* Enhanced markers visualization */}
          <div className="absolute inset-4 pointer-events-none">
            {markersWithDistance.slice(0, 12).map((marker, index) => (
              <div
                key={marker.id}
                className={`absolute w-4 h-4 ${getMarkerColor(marker.type)} rounded-full border-2 border-white shadow-lg cursor-pointer transform hover:scale-110 transition-transform`}
                style={{
                  left: `${15 + (index % 4) * 20}%`,
                  top: `${15 + Math.floor(index / 4) * 20}%`,
                  pointerEvents: 'auto'
                }}
                onClick={() => handleMarkerClick(marker)}
                title={`${marker.title} - ${marker.description || ''}`}
              />
            ))}
            
            {/* User location marker with enhanced styling */}
            {currentLocation && showUserLocation && (
              <div className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ left: '50%', top: '50%' }}>
                <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg animate-pulse relative">
                  <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                </div>
              </div>
            )}
          </div>

          {/* Distance Circles (visual representation) */}
          {currentLocation && showUserLocation && (
            <div className="absolute inset-0 pointer-events-none">
              <div 
                className="absolute border border-blue-300 border-opacity-50 rounded-full"
                style={{
                  left: '30%',
                  top: '30%',
                  width: '40%',
                  height: '40%'
                }}
              />
              <div 
                className="absolute border border-blue-200 border-opacity-30 rounded-full"
                style={{
                  left: '20%',
                  top: '20%',
                  width: '60%',
                  height: '60%'
                }}
              />
            </div>
          )}
        </div>

        {/* Enhanced Markers List */}
        {markersWithDistance.length > 0 && (
          <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Nearby Listings</h4>
              <span className="text-xs text-gray-500">
                Sorted by distance
              </span>
            </div>
            {markersWithDistance.slice(0, 8).map((marker) => (
              <div 
                key={marker.id}
                className="bg-white p-3 rounded border shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleMarkerClick(marker)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 ${getMarkerColor(marker.type)} rounded-full`}></div>
                      <div className="text-sm font-medium">{marker.title}</div>
                    </div>
                    {marker.description && (
                      <div className="text-xs text-gray-500 mt-1 ml-5">{marker.description}</div>
                    )}
                    <div className="text-xs text-gray-400 mt-1 ml-5">
                      {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
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
            {markersWithDistance.length > 8 && (
              <div className="text-xs text-gray-500 text-center py-2">
                +{markersWithDistance.length - 8} more markers
              </div>
            )}
          </div>
        )}

        {/* Enhanced Selected Marker Info */}
        {selectedMarker && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 ${getMarkerColor(selectedMarker.type)} rounded-full`}></div>
              <h4 className="font-medium text-blue-900">{selectedMarker.title}</h4>
            </div>
            {selectedMarker.description && (
              <p className="text-sm text-blue-700 mb-2">{selectedMarker.description}</p>
            )}
            <div className="grid grid-cols-2 gap-4 text-xs text-blue-600">
              <div>
                <span className="font-medium">Type:</span> {selectedMarker.type}
              </div>
              <div>
                <span className="font-medium">Location:</span> {selectedMarker.lat.toFixed(4)}, {selectedMarker.lng.toFixed(4)}
              </div>
              {selectedMarker.distance && (
                <div>
                  <span className="font-medium">Distance:</span> {formatDistance(selectedMarker.distance)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced User Location Display */}
        {currentLocation && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-800 mb-2">
              <Navigation className="h-4 w-4" />
              <span className="font-medium">Your Location</span>
              <span className="text-xs bg-green-200 px-2 py-1 rounded">Active</span>
            </div>
            <div className="text-sm text-green-700 mb-1">
              {currentLocation.address}
            </div>
            <div className="text-xs text-green-600">
              {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InteractiveMap;
