
import { useState, useCallback } from 'react';
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

export const useCurrentLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { getCurrentLocation, calculateDistance, formatDistance } = useGeolocation();
  const { toast } = useToast();

  const detectCurrentLocation = useCallback(async () => {
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
  }, [getCurrentLocation, toast]);

  const reverseGeocode = async (lat: number, lng: number) => {
    // Mock reverse geocoding - in production, use Google Maps Geocoding API
    try {
      // Simulated API response based on common US locations
      const mockCities = [
        { name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194 },
        { name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
        { name: 'New York, NY', lat: 40.7128, lng: -74.0060 },
        { name: 'Chicago, IL', lat: 41.8781, lng: -87.6298 },
        { name: 'Austin, TX', lat: 30.2672, lng: -97.7431 },
      ];
      
      // Find closest city for demo purposes
      let closestCity = mockCities[0];
      let minDistance = calculateDistance(lat, lng, closestCity.lat, closestCity.lng);
      
      for (const city of mockCities) {
        const distance = calculateDistance(lat, lng, city.lat, city.lng);
        if (distance < minDistance) {
          minDistance = distance;
          closestCity = city;
        }
      }
      
      return {
        formatted_address: closestCity.name,
        city: closestCity.name.split(',')[0],
        state: closestCity.name.split(',')[1]?.trim(),
        country: 'United States',
        postalCode: '00000'
      };
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return {
        formatted_address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      };
    }
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
