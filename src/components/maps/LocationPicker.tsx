
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Target } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/use-toast';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void;
  defaultLocation?: Location;
  className?: string;
}

const LocationPicker = ({ onLocationSelect, defaultLocation, className = "" }: LocationPickerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(defaultLocation || null);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const { position, getCurrentLocation, loading: locationLoading } = useGeolocation();
  const { toast } = useToast();

  // Mock location suggestions - in production, use Google Places API
  const mockSuggestions = [
    { lat: 40.7128, lng: -74.0060, address: "New York, NY" },
    { lat: 34.0522, lng: -118.2437, address: "Los Angeles, CA" },
    { lat: 41.8781, lng: -87.6298, address: "Chicago, IL" },
    { lat: 29.7604, lng: -95.3698, address: "Houston, TX" },
    { lat: 33.4484, lng: -112.0740, address: "Phoenix, AZ" },
  ];

  useEffect(() => {
    if (searchQuery.length > 2) {
      // Filter mock suggestions based on search query
      const filtered = mockSuggestions.filter(location =>
        location.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    onLocationSelect(location);
    setSuggestions([]);
    setSearchQuery(location.address);
  };

  const handleUseCurrentLocation = async () => {
    try {
      await getCurrentLocation();
      if (position) {
        const location: Location = {
          lat: position.latitude,
          lng: position.longitude,
          address: `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`
        };
        handleLocationSelect(location);
        toast({
          title: "Location found",
          description: "Using your current location",
        });
      }
    } catch (error) {
      toast({
        title: "Location error",
        description: "Could not get your current location",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Select Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Current Location Button */}
        <Button 
          onClick={handleUseCurrentLocation} 
          disabled={locationLoading}
          variant="outline"
          className="w-full flex items-center gap-2"
        >
          <Target className="h-4 w-4" />
          {locationLoading ? 'Getting location...' : 'Use Current Location'}
        </Button>

        {/* Search Suggestions */}
        {suggestions.length > 0 && (
          <div className="border rounded-md max-h-48 overflow-y-auto">
            {suggestions.map((location, index) => (
              <button
                key={index}
                onClick={() => handleLocationSelect(location)}
                className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 flex items-center gap-2"
              >
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{location.address}</span>
              </button>
            ))}
          </div>
        )}

        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Selected Location:</span>
            </div>
            <p className="text-blue-700 text-sm mt-1">{selectedLocation.address}</p>
            <p className="text-blue-600 text-xs">
              {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
            </p>
          </div>
        )}

        {/* Mock Map Display */}
        <div className="h-48 bg-gray-100 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Interactive Map</p>
            <p className="text-xs">(Google Maps integration needed)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationPicker;
