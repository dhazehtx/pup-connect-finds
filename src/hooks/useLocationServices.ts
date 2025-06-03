
import { useState, useEffect, useCallback } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
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
  maxDistance: number; // in km
  allowLocationSharing: boolean;
  autoDetectLocation: boolean;
}

export const useLocationServices = () => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [savedLocations, setSavedLocations] = useState<Location[]>([]);
  const [locationPreferences, setLocationPreferences] = useState<LocationPreferences>({
    maxDistance: 50,
    allowLocationSharing: true,
    autoDetectLocation: true
  });
  const [loading, setLoading] = useState(false);
  
  const { getCurrentLocation, calculateDistance, formatDistance } = useGeolocation();
  const { toast } = useToast();

  // Load saved locations and preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedLocations');
    if (saved) {
      setSavedLocations(JSON.parse(saved));
    }
    
    const prefs = localStorage.getItem('locationPreferences');
    if (prefs) {
      setLocationPreferences(JSON.parse(prefs));
    }
  }, []);

  // Auto-detect location on mount if enabled
  useEffect(() => {
    if (locationPreferences.autoDetectLocation) {
      detectCurrentLocation();
    }
  }, [locationPreferences.autoDetectLocation]);

  const detectCurrentLocation = useCallback(async () => {
    if (!locationPreferences.allowLocationSharing) {
      toast({
        title: "Location sharing disabled",
        description: "Enable location sharing in your preferences to use this feature",
        variant: "destructive",
      });
      return null;
    }

    try {
      setLoading(true);
      const position = await getCurrentLocation();
      
      // Reverse geocode to get address
      const address = await reverseGeocode(position.latitude, position.longitude);
      
      const location: Location = {
        lat: position.latitude,
        lng: position.longitude,
        address: address.formatted_address || `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`,
        city: address.city,
        state: address.state,
        country: address.country,
        postalCode: address.postalCode
      };
      
      setCurrentLocation(location);
      return location;
    } catch (error) {
      console.error('Error detecting location:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getCurrentLocation, locationPreferences.allowLocationSharing, toast]);

  const reverseGeocode = async (lat: number, lng: number) => {
    // Mock reverse geocoding - in production, use Google Maps Geocoding API
    try {
      // Simulated API response
      return {
        formatted_address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        city: 'Unknown City',
        state: 'Unknown State',
        country: 'Unknown Country',
        postalCode: '00000'
      };
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return {
        formatted_address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      };
    }
  };

  const searchLocation = async (query: string): Promise<Location[]> => {
    // Mock location search - in production, use Google Places API
    const mockResults: Location[] = [
      { lat: 40.7128, lng: -74.0060, address: "New York, NY", city: "New York", state: "NY" },
      { lat: 34.0522, lng: -118.2437, address: "Los Angeles, CA", city: "Los Angeles", state: "CA" },
      { lat: 41.8781, lng: -87.6298, address: "Chicago, IL", city: "Chicago", state: "IL" },
    ];
    
    return mockResults.filter(location => 
      location.address.toLowerCase().includes(query.toLowerCase())
    );
  };

  const saveLocation = (location: Location, name?: string) => {
    const locationToSave = {
      ...location,
      address: name || location.address
    };
    
    const updated = [...savedLocations, locationToSave];
    setSavedLocations(updated);
    localStorage.setItem('savedLocations', JSON.stringify(updated));
    
    toast({
      title: "Location saved",
      description: `Saved "${locationToSave.address}"`,
    });
  };

  const removeLocation = (index: number) => {
    const updated = savedLocations.filter((_, i) => i !== index);
    setSavedLocations(updated);
    localStorage.setItem('savedLocations', JSON.stringify(updated));
  };

  const updatePreferences = (newPrefs: Partial<LocationPreferences>) => {
    const updated = { ...locationPreferences, ...newPrefs };
    setLocationPreferences(updated);
    localStorage.setItem('locationPreferences', JSON.stringify(updated));
  };

  const getDistanceToLocation = (targetLocation: Location): number | null => {
    if (!currentLocation) return null;
    return calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      targetLocation.lat,
      targetLocation.lng
    );
  };

  const filterLocationsByDistance = (locations: Location[]): Location[] => {
    if (!currentLocation) return locations;
    
    return locations.filter(location => {
      const distance = getDistanceToLocation(location);
      return distance === null || distance <= locationPreferences.maxDistance;
    });
  };

  const getNearbyListings = async (location?: Location) => {
    const searchLocation = location || currentLocation;
    if (!searchLocation) return [];

    // This would integrate with your listings search to filter by location
    // For now, return empty array as placeholder
    return [];
  };

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
    filterLocationsByDistance,
    getNearbyListings,
    calculateDistance,
    formatDistance
  };
};
