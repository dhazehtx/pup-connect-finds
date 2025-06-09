
import { useToast } from '@/hooks/use-toast';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { useSavedLocations } from '@/hooks/useSavedLocations';
import { useLocationPreferences } from '@/hooks/useLocationPreferences';
import { useLocationSearch } from '@/hooks/useLocationSearch';

interface Location {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export const useLocationServices = () => {
  const { toast } = useToast();
  
  const {
    currentLocation,
    setCurrentLocation,
    loading,
    detectCurrentLocation: _detectCurrentLocation,
    getDistanceToLocation,
    calculateDistance,
    formatDistance
  } = useCurrentLocation();
  
  const {
    savedLocations,
    saveLocation,
    removeLocation
  } = useSavedLocations();
  
  const {
    locationPreferences,
    updatePreferences
  } = useLocationPreferences();
  
  const {
    searchLocation
  } = useLocationSearch();

  const detectCurrentLocation = async () => {
    if (!locationPreferences.allowLocationSharing) {
      toast({
        title: "Location sharing disabled",
        description: "Enable location sharing in your preferences to use this feature",
        variant: "destructive",
      });
      return null;
    }

    return await _detectCurrentLocation();
  };

  const filterLocationsByDistance = (locations: Location[]): Location[] => {
    if (!currentLocation) return locations;
    
    return locations.filter(location => {
      const distance = getDistanceToLocation(location);
      return distance === null || distance <= locationPreferences.maxDistance;
    });
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
    calculateDistance,
    formatDistance
  };
};
