
import { useState, useEffect } from 'react';
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

export const useSavedLocations = () => {
  const [savedLocations, setSavedLocations] = useState<Location[]>([]);
  const { toast } = useToast();

  // Load saved locations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedLocations');
    if (saved) {
      setSavedLocations(JSON.parse(saved));
    }
  }, []);

  const saveLocation = (location: Location, customName?: string) => {
    const locationToSave = customName 
      ? { ...location, address: customName }
      : location;
    
    const updatedLocations = [...savedLocations, locationToSave];
    setSavedLocations(updatedLocations);
    localStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
    
    toast({
      title: "Location saved",
      description: `${locationToSave.address} has been saved to your locations`,
    });
  };

  const removeLocation = (index: number) => {
    const updatedLocations = savedLocations.filter((_, i) => i !== index);
    setSavedLocations(updatedLocations);
    localStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
    
    toast({
      title: "Location removed",
      description: "Location has been removed from your saved locations",
    });
  };

  return {
    savedLocations,
    saveLocation,
    removeLocation
  };
};
