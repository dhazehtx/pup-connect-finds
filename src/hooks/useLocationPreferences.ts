
import { useState, useEffect } from 'react';

interface LocationPreferences {
  maxDistance: number; // in miles
  allowLocationSharing: boolean;
  autoDetectLocation: boolean;
}

export const useLocationPreferences = () => {
  const [locationPreferences, setLocationPreferences] = useState<LocationPreferences>({
    maxDistance: 50,
    allowLocationSharing: true,
    autoDetectLocation: false
  });

  // Load preferences from localStorage
  useEffect(() => {
    const prefs = localStorage.getItem('locationPreferences');
    if (prefs) {
      setLocationPreferences(JSON.parse(prefs));
    }
  }, []);

  const updatePreferences = (newPrefs: Partial<LocationPreferences>) => {
    const updated = { ...locationPreferences, ...newPrefs };
    setLocationPreferences(updated);
    localStorage.setItem('locationPreferences', JSON.stringify(updated));
  };

  return {
    locationPreferences,
    updatePreferences
  };
};
