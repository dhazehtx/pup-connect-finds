
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Battery, Wifi, Signal, MapPin, Smartphone } from 'lucide-react';

interface DeviceStatusProps {
  batteryLevel: number;
  isOnline: boolean;
  location: { lat: number; lng: number } | null;
}

export const DeviceStatus = ({ batteryLevel, isOnline, location }: DeviceStatusProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Device Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Battery className="h-4 w-4" />
            <span className="text-sm">{batteryLevel}%</span>
          </div>
          
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">Online</span>
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-500">Offline</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Signal className="h-4 w-4" />
            <span className="text-sm">4G</span>
          </div>
          
          <div className="flex items-center gap-2">
            {location ? (
              <>
                <MapPin className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">Located</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">No location</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
