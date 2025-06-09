
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, ZoomIn, ZoomOut, Crosshair } from 'lucide-react';
import { useLocationServices } from '@/hooks/useLocationServices';
import { useToast } from '@/hooks/use-toast';
import RealGoogleMap from './RealGoogleMap';
import { GoogleMapsService } from '@/services/GoogleMapsService';

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
  zoom = 12,
  onMarkerClick,
  showUserLocation = true,
  className = ""
}: InteractiveMapProps) => {
  const { currentLocation } = useLocationServices();
  const [mapCenter, setMapCenter] = useState(center || { lat: 37.7749, lng: -122.4194 });
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [mapZoom, setMapZoom] = useState(zoom);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (currentLocation && showUserLocation && !center) {
      const location = { lat: currentLocation.lat, lng: currentLocation.lng };
      setMapCenter(location);
      setUserLocation(location);
    }
  }, [currentLocation, showUserLocation, center]);

  const markersWithDistance = markers.map(marker => ({
    ...marker,
    distance: userLocation ? GoogleMapsService.calculateDistance(
      userLocation, 
      { lat: marker.lat, lng: marker.lng }
    ) : undefined
  })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await GoogleMapsService.getCurrentLocation();
      setUserLocation(location);
      setMapCenter(location);
      
      try {
        const address = await GoogleMapsService.reverseGeocode(location.lat, location.lng);
        toast({
          title: "Location found",
          description: `${address} (±${Math.round(location.accuracy)}m)`,
        });
      } catch (error) {
        toast({
          title: "Location found",
          description: `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)} (±${Math.round(location.accuracy)}m)`,
        });
      }
    } catch (error) {
      toast({
        title: "Location error",
        description: error instanceof Error ? error.message : "Unable to get location",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
    onMarkerClick?.(marker);
  };

  const allMarkers = [
    ...(userLocation ? [{
      id: 'user-location',
      lat: userLocation.lat,
      lng: userLocation.lng,
      title: 'Your Location',
      type: 'user' as const
    }] : []),
    ...markersWithDistance
  ];

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Interactive Map
          </div>
          <div className="flex items-center gap-2">
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
        </CardTitle>
        
        <div className="flex gap-2 mt-4">
          <Button 
            onClick={handleGetCurrentLocation}
            disabled={isLoadingLocation}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {isLoadingLocation ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            {isLoadingLocation ? 'Locating...' : 'My Location'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMapCenter({ lat: 37.7749, lng: -122.4194 })}
          >
            <Crosshair className="h-4 w-4 mr-2" />
            Reset View
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <RealGoogleMap
          center={mapCenter}
          zoom={mapZoom}
          markers={allMarkers}
          onMarkerClick={handleMarkerClick}
          className="w-full h-96 rounded-md overflow-hidden"
        />

        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Center:</span> {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
            </div>
            <div>
              <span className="font-medium">Zoom:</span> {mapZoom}
            </div>
            <div>
              <span className="font-medium">Markers:</span> {markersWithDistance.length}
            </div>
            <div>
              <span className="font-medium">Distance:</span> Real calculations
            </div>
          </div>
        </div>

        {userLocation && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-800 mb-2">
              <Navigation className="h-4 w-4" />
              <span className="font-medium">Your Location</span>
            </div>
            <div className="text-sm text-green-700">
              {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
            </div>
          </div>
        )}

        {selectedMarker && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-medium text-blue-900 mb-2">{selectedMarker.title}</h4>
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
                <div className="col-span-2">
                  <span className="font-medium">Distance:</span> {selectedMarker.distance.toFixed(1)} miles
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InteractiveMap;
