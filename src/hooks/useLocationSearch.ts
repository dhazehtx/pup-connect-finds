
import { useCallback } from 'react';
import { GoogleMapsService } from '@/services/GoogleMapsService';

interface Location {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export const useLocationSearch = () => {
  const searchLocation = useCallback(async (query: string): Promise<Location[]> => {
    try {
      const results = await GoogleMapsService.searchPlaces(query);
      
      return results.map(result => ({
        lat: result.lat,
        lng: result.lng,
        address: result.address,
        city: result.address.split(',')[0]?.trim(),
        state: result.address.split(',')[1]?.trim(),
        country: 'United States'
      }));
    } catch (error) {
      console.error('Location search failed:', error);
      return [];
    }
  }, []);

  return {
    searchLocation
  };
};
