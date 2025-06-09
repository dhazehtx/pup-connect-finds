
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

const LocationPrompt = () => {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">Enable Location for Recommendations</h3>
        <p className="text-gray-500">
          Allow location access to see personalized recommendations based on your area
        </p>
      </CardContent>
    </Card>
  );
};

export default LocationPrompt;
