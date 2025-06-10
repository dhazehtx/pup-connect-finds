
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Monitor connection status
    const channel = supabase.channel('connection-test');
    
    channel
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true);
        setLastUpdate(new Date());
      })
      .subscribe((status) => {
        console.log('Connection status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Heartbeat to detect disconnections
    const heartbeat = setInterval(() => {
      const now = new Date();
      const timeSinceUpdate = now.getTime() - lastUpdate.getTime();
      
      // If no updates for 30 seconds, consider disconnected
      if (timeSinceUpdate > 30000) {
        setIsConnected(false);
      }
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(heartbeat);
    };
  }, [lastUpdate]);

  return (
    <div className="flex items-center gap-2 px-3 py-1">
      <Badge 
        variant={isConnected ? "outline" : "destructive"} 
        className="text-xs flex items-center gap-1"
      >
        {isConnected ? (
          <>
            <Wifi size={12} />
            Connected
          </>
        ) : (
          <>
            <WifiOff size={12} />
            Disconnected
          </>
        )}
      </Badge>
    </div>
  );
};

export default ConnectionStatus;
