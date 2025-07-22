
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConnectionStatusProps {
  isConnected: boolean;
  onRetry?: () => void;
}

const ConnectionStatus = ({ isConnected, onRetry }: ConnectionStatusProps) => {
  const [showStatus, setShowStatus] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      setShowStatus(true);
      setWasOffline(true);
    } else if (wasOffline && isConnected) {
      // Show "reconnected" message briefly
      setShowStatus(true);
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, wasOffline]);

  if (!showStatus) return null;

  return (
    <Alert className={`mb-4 ${isConnected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={isConnected ? 'text-green-700' : 'text-red-700'}>
            {isConnected ? 'Reconnected to chat' : 'Connection lost. Messages may not send until reconnected.'}
          </AlertDescription>
        </div>
        
        {!isConnected && onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="ml-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    </Alert>
  );
};

export default ConnectionStatus;
