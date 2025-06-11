
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface LocationDisplayProps {
  location: { lat: number; lng: number } | null;
}

export const LocationDisplay = ({ location }: LocationDisplayProps) => {
  if (!location) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Current Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-1">
          <p>Latitude: {location.lat.toFixed(6)}</p>
          <p>Longitude: {location.lng.toFixed(6)}</p>
        </div>
      </CardContent>
    </Card>
  );
};
