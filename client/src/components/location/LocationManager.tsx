
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Settings, Trash2, Save, Navigation } from 'lucide-react';
import { useLocationServices } from '@/hooks/useLocationServices';

const LocationManager = () => {
  const {
    currentLocation,
    savedLocations,
    locationPreferences,
    loading,
    detectCurrentLocation,
    searchLocation,
    saveLocation,
    removeLocation,
    updatePreferences,
    formatDistance
  } = useLocationServices();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await searchLocation(searchQuery);
      setSearchResults(results);
    }
  };

  const handleSaveCurrentLocation = () => {
    if (currentLocation) {
      const name = prompt('Enter a name for this location:');
      if (name) {
        saveLocation(currentLocation, name);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Current Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentLocation ? (
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{currentLocation.address}</p>
                  <p className="text-sm text-gray-500">
                    {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                  </p>
                  {currentLocation.city && (
                    <p className="text-sm text-gray-500">
                      {currentLocation.city}, {currentLocation.state}
                    </p>
                  )}
                </div>
                <Button onClick={handleSaveCurrentLocation} size="sm" variant="outline">
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-4">No location detected</p>
              <Button onClick={detectCurrentLocation} disabled={loading}>
                <Navigation className="h-4 w-4 mr-2" />
                {loading ? 'Detecting...' : 'Detect My Location'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Locations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <Label>Search Results</Label>
              {searchResults.map((location, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{location.address}</p>
                    {currentLocation && (
                      <p className="text-sm text-gray-500">
                        {formatDistance(
                          Math.sqrt(
                            Math.pow(location.lat - currentLocation.lat, 2) +
                            Math.pow(location.lng - currentLocation.lng, 2)
                          ) * 111
                        )} away
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => saveLocation(location)}
                  >
                    Save
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Saved Locations ({savedLocations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {savedLocations.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No saved locations</p>
          ) : (
            <div className="space-y-2">
              {savedLocations.map((location, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{location.address}</p>
                    <p className="text-sm text-gray-500">
                      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </p>
                    {currentLocation && (
                      <Badge variant="secondary" className="mt-1">
                        {formatDistance(
                          Math.sqrt(
                            Math.pow(location.lat - currentLocation.lat, 2) +
                            Math.pow(location.lng - currentLocation.lng, 2)
                          ) * 111
                        )} away
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeLocation(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Location Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Location Sharing</Label>
              <p className="text-sm text-gray-500">Enable GPS location detection</p>
            </div>
            <Switch
              checked={locationPreferences.allowLocationSharing}
              onCheckedChange={(checked) => 
                updatePreferences({ allowLocationSharing: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-Detect Location</Label>
              <p className="text-sm text-gray-500">Automatically detect location when app opens</p>
            </div>
            <Switch
              checked={locationPreferences.autoDetectLocation}
              onCheckedChange={(checked) => 
                updatePreferences({ autoDetectLocation: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Search Radius: {locationPreferences.maxDistance}km</Label>
            <Slider
              value={[locationPreferences.maxDistance]}
              onValueChange={([value]) => updatePreferences({ maxDistance: value })}
              max={200}
              min={5}
              step={5}
              className="w-full"
            />
            <p className="text-sm text-gray-500">
              Maximum distance to search for listings
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationManager;
