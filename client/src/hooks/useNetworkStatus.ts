
import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsConnecting(false);
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleBeforeUnload = () => {
      setIsConnecting(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return { isOnline, isConnecting };
};
