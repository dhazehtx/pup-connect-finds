import React, { useEffect, useRef, useState } from 'react';
import { GoogleMapsService } from '@/services/GoogleMapsService';
import { useToast } from '@/hooks/use-toast';

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type?: 'listing' | 'user' | 'breeder';
}

interface RealGoogleMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
  className?: string;
}

const RealGoogleMap: React.FC<RealGoogleMapProps> = ({
  center,
  zoom = 12,
  markers = [],
  onMarkerClick,
  className = "w-full h-96"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [googleMarkers, setGoogleMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializeMap = async () => {
      try {
        setIsLoading(true);
        const googleMaps = await GoogleMapsService.loadGoogleMaps();
        
        if (!googleMaps) {
          throw new Error('Failed to load Google Maps');
        }
        
        if (mapRef.current) {
          const newMap = new googleMaps.maps.Map(mapRef.current, {
            center,
            zoom,
            mapTypeId: googleMaps.maps.MapTypeId.ROADMAP,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });
          
          setMap(newMap);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load map');
        toast({
          title: "Map Error",
          description: "Failed to load Google Maps. Please check your API configuration.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [center, zoom, toast]);

  useEffect(() => {
    if (map) {
      map.setCenter(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);

  useEffect(() => {
    if (map && window.google) {
      // Clear existing markers
      googleMarkers.forEach(marker => marker.setMap(null));

      // Add new markers
      const newMarkers = markers.map(markerData => {
        const marker = new window.google.maps.Marker({
          position: { lat: markerData.lat, lng: markerData.lng },
          map,
          title: markerData.title,
          animation: window.google.maps.Animation.DROP,
          icon: markerData.type === 'user' ? {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(24, 24)
          } : undefined
        });

        if (onMarkerClick) {
          marker.addListener('click', () => onMarkerClick(markerData));
        }

        return marker;
      });

      setGoogleMarkers(newMarkers);
    }
  }, [map, markers, onMarkerClick]);

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-md`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-red-50 border border-red-200 rounded-md`}>
        <div className="text-center p-4">
          <p className="text-red-600 font-medium">Map Error</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
          <p className="text-red-400 text-xs mt-2">
            Please ensure REACT_APP_GOOGLE_MAPS_API_KEY is set
          </p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className={className} />;
};

export default RealGoogleMap;
