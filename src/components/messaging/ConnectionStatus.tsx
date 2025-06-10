
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';
import { useOfflineMessages } from '@/hooks/useOfflineMessages';

const ConnectionStatus = () => {
  const { isOnline } = useOfflineMessages();

  return (
    <Badge 
      variant={isOnline ? "default" : "destructive"} 
      className="flex items-center gap-1 text-xs"
    >
      {isOnline ? (
        <>
          <Wifi size={12} />
          Online
        </>
      ) : (
        <>
          <WifiOff size={12} />
          Offline
        </>
      )}
    </Badge>
  );
};

export default ConnectionStatus;
