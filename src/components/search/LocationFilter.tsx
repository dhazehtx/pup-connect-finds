
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { MapPin, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationFilterProps {
  onLocationChange: (location: any, radius: number) => void;
  selectedLocation?: any;
  selectedRadius: number;
}

const LocationFilter = ({ 
  onLocationChange, 
  selectedLocation, 
  selectedRadius 
}: LocationFilterProps) => {
  const [locationQuery, setLocationQuery] = useState('');
  const [radius, setRadius] = useState(selectedRadius);
  const [isDetecting, setIsDetecting] = useState(false);
  const { toast } = useToast();

  const handleLocationSearch = () => {
    if (!locationQuery.trim()) return;
    
    // Simulate location search
    const mockLocation = {
      address: locationQuery,
      lat: 37.7749 + (Math.random() - 0.5) * 0.1,
      lng: -122.4194 + (Math.random() - 0.5) * 0.1
    };
    
    onLocationChange(mockLocation, radius);
    toast({
      title: "Location Set",
      description: `Search area set to ${locationQuery}`,
    });
  };

  const handleCurrentLocation = () => {
    setIsDetecting(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            address: 'Current Location',
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          onLocationChange(location, radius);
          setIsDetecting(false);
          toast({
            title: "Location Detected",
            description: "Using your current location for search",
          });
        },
        (error) => {
          setIsDetecting(false);
          toast({
            title: "Location Error",
            description: "Unable to detect your location. Please enter manually.",
            variant: "destructive",
          });
        }
      );
    } else {
      setIsDetecting(false);
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  };

  const handleRadiusChange = (newRadius: number[]) => {
    const radiusValue = newRadius[0];
    setRadius(radiusValue);
    if (selectedLocation) {
      onLocationChange(selectedLocation, radiusValue);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location & Distance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current location */}
        {selectedLocation && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{selectedLocation.address}</span>
            </div>
          </div>
        )}

        {/* Location search */}
        <div className="flex gap-2">
          <Input
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            placeholder="Enter city, zip code, or address..."
            className="flex-1"
          />
          <Button onClick={handleLocationSearch} disabled={!locationQuery.trim()}>
            Search
          </Button>
        </div>

        {/* Current location button */}
        <Button
          variant="outline"
          onClick={handleCurrentLocation}
          disabled={isDetecting}
          className="w-full flex items-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          {isDetecting ? 'Detecting...' : 'Use Current Location'}
        </Button>

        {/* Radius slider */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Search Radius: {radius} miles
          </label>
          <Slider
            value={[radius]}
            onValueChange={handleRadiusChange}
            max={100}
            min={5}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5 miles</span>
            <span>100 miles</span>
          </div>
        </div>

        {/* Quick distance options */}
        <div className="flex gap-2 flex-wrap">
          {[10, 25, 50, 100].map((distance) => (
            <Button
              key={distance}
              variant={radius === distance ? "default" : "outline"}
              size="sm"
              onClick={() => handleRadiusChange([distance])}
            >
              {distance} mi
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationFilter;
