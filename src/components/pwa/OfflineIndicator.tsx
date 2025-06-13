
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi } from 'lucide-react';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';

const OfflineIndicator = () => {
  const { isOnline } = useMobileFeatures();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-16 left-4 right-4 z-50">
      <Alert variant="destructive" className="shadow-lg">
        <WifiOff className="h-4 w-4" />
        <AlertDescription>
          You're offline. Some features may not be available.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default OfflineIndicator;
