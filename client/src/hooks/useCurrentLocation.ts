
import { useState, useCallback } from 'react';
import { GoogleMapsService } from '@/services/GoogleMapsService';
import { useToast } from '@/hooks/use-toast';

interface Location {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export const useCurrentLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const detectCurrentLocation = useCallback(async () => {
    try {
      setLoading(true);
      const position = await GoogleMapsService.getCurrentLocation();
      
      let address = `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`;
      try {
        address = await GoogleMapsService.reverseGeocode(position.lat, position.lng);
      } catch (error) {
        console.warn('Reverse geocoding failed:', error);
      }
      
      const location: Location = {
        lat: position.lat,
        lng: position.lng,
        address: address,
        // Parse city/state from address if possible
        city: address.split(',')[1]?.trim(),
        state: address.split(',')[2]?.trim(),
        country: 'United States'
      };
      
      setCurrentLocation(location);
      return location;
    } catch (error) {
      console.error('Error detecting location:', error);
      toast({
        title: "Location Error",
        description: error instanceof Error ? error.message : "Unable to detect location",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getDistanceToLocation = (targetLocation: Location): number | null => {
    if (!currentLocation) return null;
    return GoogleMapsService.calculateDistance(
      currentLocation,
      targetLocation
    );
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    return GoogleMapsService.calculateDistance(
      { lat: lat1, lng: lng1 },
      { lat: lat2, lng: lng2 }
    );
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 5280)}ft`;
    } else {
      return `${distance.toFixed(1)}mi`;
    }
  };

  return {
    currentLocation,
    setCurrentLocation,
    loading,
    detectCurrentLocation,
    getDistanceToLocation,
    calculateDistance,
    formatDistance
  };
};
