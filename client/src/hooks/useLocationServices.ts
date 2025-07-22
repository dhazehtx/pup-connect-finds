
import { useState, useCallback } from 'react';
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

interface LocationPreferences {
  maxDistance: number;
  preferredAreas: string[];
  autoDetectLocation: boolean;
  allowLocationSharing: boolean;
}

export const useLocationServices = () => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [savedLocations, setSavedLocations] = useState<Location[]>([]);
  const [locationPreferences, setLocationPreferences] = useState<LocationPreferences>({
    maxDistance: 50,
    preferredAreas: [],
    autoDetectLocation: true,
    allowLocationSharing: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const detectCurrentLocation = useCallback(async (): Promise<Location | null> => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Mock reverse geocoding - in production, use Google Maps or similar service
          const mockLocation: Location = {
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            city: 'Current City',
            state: 'Current State',
            country: 'United States'
          };
          
          setCurrentLocation(mockLocation);
          setLoading(false);
          
          toast({
            title: "Location detected",
            description: "Your current location has been set for search",
          });
          
          resolve(mockLocation);
        },
        (error) => {
          setLoading(false);
          toast({
            title: "Location error",
            description: "Unable to detect your location. Please enter manually.",
            variant: "destructive"
          });
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });
  }, [toast]);

  const searchLocation = useCallback(async (query: string): Promise<Location[]> => {
    if (!query.trim()) return [];
    
    setLoading(true);
    
    // Mock location search - in production, use Google Places API
    const mockResults: Location[] = [
      {
        lat: 37.7749 + (Math.random() - 0.5) * 0.1,
        lng: -122.4194 + (Math.random() - 0.5) * 0.1,
        address: `${query}, CA, USA`,
        city: query,
        state: 'California',
        country: 'United States'
      }
    ];
    
    setLoading(false);
    return mockResults;
  }, []);

  const saveLocation = useCallback((location: Location, customName?: string) => {
    const locationToSave = customName 
      ? { ...location, address: customName }
      : location;
    
    setSavedLocations(prev => [...prev, locationToSave]);
    
    toast({
      title: "Location saved",
      description: `${locationToSave.address} has been saved to your locations`,
    });
  }, [toast]);

  const removeLocation = useCallback((index: number) => {
    setSavedLocations(prev => prev.filter((_, i) => i !== index));
    
    toast({
      title: "Location removed",
      description: "Location has been removed from your saved locations",
    });
  }, [toast]);

  const updatePreferences = useCallback((preferences: Partial<LocationPreferences>) => {
    setLocationPreferences(prev => ({ ...prev, ...preferences }));
  }, []);

  const getDistanceToLocation = useCallback((targetLocation: Location): number | null => {
    if (!currentLocation) return null;
    
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in kilometers
    const dLat = (targetLocation.lat - currentLocation.lat) * Math.PI / 180;
    const dLng = (targetLocation.lng - currentLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(currentLocation.lat * Math.PI / 180) * Math.cos(targetLocation.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  }, [currentLocation]);

  const formatDistance = useCallback((distance: number): string => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km`;
    } else {
      return `${distance.toFixed(0)}km`;
    }
  }, []);

  const setManualLocation = useCallback((location: Location) => {
    setCurrentLocation(location);
    toast({
      title: "Location set",
      description: `Search location set to ${location.address}`,
    });
  }, [toast]);

  return {
    currentLocation,
    savedLocations,
    locationPreferences,
    loading,
    detectCurrentLocation,
    searchLocation,
    saveLocation,
    removeLocation,
    updatePreferences,
    getDistanceToLocation,
    formatDistance,
    setManualLocation
  };
};
