
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

interface CurrentLocationDisplayProps {
  currentLocation: Location;
}

const CurrentLocationDisplay = ({ currentLocation }: CurrentLocationDisplayProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-blue-500" />
          <span className="font-medium">Searching from:</span>
          <span>{currentLocation.address}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentLocationDisplay;
