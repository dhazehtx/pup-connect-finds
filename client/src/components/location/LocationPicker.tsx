
import React, { useState } from 'react';
import { MapPin, Search, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocationServices } from '@/hooks/useLocationServices';

interface LocationPickerProps {
  onLocationSelect: (location: any) => void;
  selectedLocation?: any;
  showCurrentLocation?: boolean;
}

const LocationPicker = ({ 
  onLocationSelect, 
  selectedLocation, 
  showCurrentLocation = true 
}: LocationPickerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    currentLocation,
    detectCurrentLocation,
    searchLocation,
    loading: locationLoading
  } = useLocationServices();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const results = await searchLocation(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Location search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    const location = await detectCurrentLocation();
    if (location) {
      onLocationSelect(location);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Enter city, state, or zip code"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading || !searchQuery.trim()}>
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Current Location Button */}
      {showCurrentLocation && (
        <Button
          variant="outline"
          onClick={handleUseCurrentLocation}
          disabled={locationLoading}
          className="w-full flex items-center gap-2"
        >
          <Target className="w-4 h-4" />
          {locationLoading ? 'Detecting location...' : 'Use current location'}
        </Button>
      )}

      {/* Selected Location */}
      {selectedLocation && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">{selectedLocation.address}</span>
              </div>
              <Badge variant="secondary">Selected</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Search Results</h4>
          {searchResults.map((location, index) => (
            <Card 
              key={index}
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onLocationSelect(location)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{location.address}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Current Location Display */}
      {currentLocation && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Current Location</p>
                <p className="text-xs text-gray-600">{currentLocation.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LocationPicker;
