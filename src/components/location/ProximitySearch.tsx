
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Target, Filter } from 'lucide-react';
import { useLocationServices } from '@/hooks/useLocationServices';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';

interface ProximitySearchProps {
  onResultsChange?: (results: any[]) => void;
}

const ProximitySearch = ({ onResultsChange }: ProximitySearchProps) => {
  const {
    currentLocation,
    locationPreferences,
    searchLocation,
    getDistanceToLocation,
    formatDistance
  } = useLocationServices();
  
  const { performSearch } = useAdvancedSearch();
  
  const [searchCenter, setSearchCenter] = useState('');
  const [searchRadius, setSearchRadius] = useState([locationPreferences.maxDistance]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [centerLocation, setCenterLocation] = useState(currentLocation);

  const performProximitySearch = async () => {
    if (!centerLocation) return;
    
    setLoading(true);
    try {
      // Search for listings with location filter
      const searchResults = await performSearch({
        location: centerLocation.city || centerLocation.address
      });
      
      // Filter by proximity and add distance info
      const resultsWithDistance = searchResults.map(result => {
        // Generate mock coordinates for demo
        const mockLat = centerLocation.lat + (Math.random() - 0.5) * 0.1;
        const mockLng = centerLocation.lng + (Math.random() - 0.5) * 0.1;
        
        const distance = getDistanceToLocation({
          lat: mockLat,
          lng: mockLng,
          address: result.location || 'Unknown'
        });
        
        return {
          ...result,
          distance,
          lat: mockLat,
          lng: mockLng,
          formattedDistance: distance ? formatDistance(distance) : null
        };
      }).filter(result => 
        !result.distance || result.distance <= searchRadius[0]
      ).sort((a, b) => (a.distance || 0) - (b.distance || 0));
      
      setResults(resultsWithDistance);
      onResultsChange?.(resultsWithDistance);
    } catch (error) {
      console.error('Proximity search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = async () => {
    if (searchCenter.trim()) {
      const locations = await searchLocation(searchCenter);
      if (locations.length > 0) {
        setCenterLocation(locations[0]);
      }
    }
  };

  useEffect(() => {
    if (centerLocation) {
      performProximitySearch();
    }
  }, [centerLocation, searchRadius]);

  useEffect(() => {
    if (currentLocation && !centerLocation) {
      setCenterLocation(currentLocation);
    }
  }, [currentLocation]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Proximity Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Center */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Center</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter city, address, or zip code"
                value={searchCenter}
                onChange={(e) => setSearchCenter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
              />
              <Button onClick={handleLocationSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {centerLocation && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-3 w-3" />
                <span>{centerLocation.address}</span>
              </div>
            )}
          </div>

          {/* Search Radius */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Search Radius: {searchRadius[0]}km
            </label>
            <Slider
              value={searchRadius}
              onValueChange={setSearchRadius}
              max={200}
              min={5}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5km</span>
              <span>200km</span>
            </div>
          </div>

          {/* Search Action */}
          <Button 
            onClick={performProximitySearch} 
            disabled={!centerLocation || loading}
            className="w-full"
          >
            {loading ? 'Searching...' : 'Search Area'}
          </Button>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Search Results</span>
              <Badge variant="secondary">
                {results.length} listings found
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Distance Distribution */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  Within 5km: {results.filter(r => r.distance && r.distance <= 5).length}
                </Badge>
                <Badge variant="outline">
                  5-15km: {results.filter(r => r.distance && r.distance > 5 && r.distance <= 15).length}
                </Badge>
                <Badge variant="outline">
                  15km+: {results.filter(r => r.distance && r.distance > 15).length}
                </Badge>
              </div>

              {/* Closest Results */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Closest Listings:</h4>
                {results.slice(0, 3).map((result, index) => (
                  <div key={result.id || index} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <span className="font-medium">{result.dog_name || result.title}</span>
                      <span className="text-sm text-gray-500 ml-2">{result.breed}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${result.price}</div>
                      {result.formattedDistance && (
                        <div className="text-sm text-blue-600">{result.formattedDistance}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProximitySearch;
