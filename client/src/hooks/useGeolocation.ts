
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface LocationPermission {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

export const useGeolocation = () => {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<LocationPermission>({
    granted: false,
    denied: false,
    prompt: true
  });
  const { toast } = useToast();

  const checkPermission = async () => {
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermission({
          granted: result.state === 'granted',
          denied: result.state === 'denied',
          prompt: result.state === 'prompt'
        });
      } catch (error) {
        console.error('Error checking geolocation permission:', error);
      }
    }
  };

  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: GeolocationPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          
          setPosition(locationData);
          setLoading(false);
          
          toast({
            title: "Location found",
            description: `Accuracy: ${Math.round(locationData.accuracy)}m`,
          });
          
          resolve(locationData);
        },
        (error) => {
          let errorMessage = 'Unknown location error';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              setPermission(prev => ({ ...prev, denied: true, granted: false }));
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          
          setError(errorMessage);
          setLoading(false);
          
          toast({
            title: "Location error",
            description: errorMessage,
            variant: "destructive",
          });
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  const calculateDistance = (
    lat1: number, 
    lng1: number, 
    lat2: number, 
    lng2: number
  ): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 5280)}ft`; // Convert to feet for distances less than 1 mile
    } else {
      return `${distance.toFixed(1)}mi`;
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  return {
    position,
    loading,
    error,
    permission,
    getCurrentLocation,
    calculateDistance,
    formatDistance,
    checkPermission
  };
};
