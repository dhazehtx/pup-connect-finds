
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

const MessagingStatusIndicator = () => {
  const isOnline = navigator.onLine;

  return (
    <div className="flex items-center justify-center p-2">
      <Badge variant={isOnline ? "secondary" : "destructive"} className="flex items-center gap-1">
        {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        {isOnline ? 'Connected' : 'Offline'}
      </Badge>
    </div>
  );
};

export default MessagingStatusIndicator;
