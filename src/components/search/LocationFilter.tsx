
import React, { useState } from 'react';
import { MapPin, Navigation, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LocationPicker from '@/components/location/LocationPicker';
import { useLocationServices } from '@/hooks/useLocationServices';

interface LocationFilterProps {
  onLocationChange: (location: any, radius: number) => void;
  selectedLocation?: any;
  selectedRadius?: number;
}

const LocationFilter = ({ 
  onLocationChange, 
  selectedLocation, 
  selectedRadius = 50 
}: LocationFilterProps) => {
  const [radius, setRadius] = useState([selectedRadius]);
  const [location, setLocation] = useState(selectedLocation);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const { formatDistance } = useLocationServices();

  const handleLocationSelect = (newLocation: any) => {
    setLocation(newLocation);
    onLocationChange(newLocation, radius[0]);
    setShowLocationPicker(false);
  };

  const handleRadiusChange = (newRadius: number[]) => {
    setRadius(newRadius);
    if (location) {
      onLocationChange(location, newRadius[0]);
    }
  };

  const clearLocation = () => {
    setLocation(null);
    onLocationChange(null, radius[0]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5" />
          Location Filter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Search Location</label>
          {location ? (
            <div className="space-y-2">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{location.address}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowLocationPicker(true)}
                      >
                        Change
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearLocation}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowLocationPicker(true)}
              className="w-full flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Select Location
            </Button>
          )}
        </div>

        {/* Location Picker Modal */}
        {showLocationPicker && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              selectedLocation={location}
            />
            <Button
              variant="ghost"
              onClick={() => setShowLocationPicker(false)}
              className="w-full mt-2"
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Radius Selection */}
        {location && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Search Radius</label>
              <Badge variant="secondary">
                {formatDistance ? formatDistance(radius[0]) : `${radius[0]} miles`}
              </Badge>
            </div>
            
            <Slider
              value={radius}
              onValueChange={handleRadiusChange}
              max={200}
              min={5}
              step={5}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 miles</span>
              <span>200 miles</span>
            </div>
          </div>
        )}

        {/* Quick Distance Options */}
        {location && (
          <div>
            <label className="text-sm font-medium mb-2 block">Quick Options</label>
            <div className="flex flex-wrap gap-2">
              {[10, 25, 50, 100].map((distance) => (
                <Badge
                  key={distance}
                  variant={radius[0] === distance ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleRadiusChange([distance])}
                >
                  {distance} miles
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Location Stats */}
        {location && (
          <div className="text-xs text-gray-600 p-2 bg-blue-50 rounded">
            <div className="flex items-center gap-1">
              <Sliders className="w-3 h-3" />
              <span>
                Searching within {formatDistance ? formatDistance(radius[0]) : `${radius[0]} miles`} of {location.city || 'selected location'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationFilter;
