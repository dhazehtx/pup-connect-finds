
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Search, X } from 'lucide-react';
import { useLocationServices } from '@/hooks/useLocationServices';
import { useDebounce } from '@/hooks/useDebounce';

interface LocationSearchInputProps {
  onLocationSelect: (location: any) => void;
  placeholder?: string;
  className?: string;
}

const LocationSearchInput = ({ 
  onLocationSelect, 
  placeholder = "Enter city, zip code, or address...",
  className = ""
}: LocationSearchInputProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { 
    currentLocation, 
    searchLocation, 
    detectCurrentLocation,
    loading: locationLoading 
  } = useLocationServices();
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.trim()) {
        setLoading(true);
        const results = await searchLocation(debouncedQuery);
        setSuggestions(results);
        setShowSuggestions(true);
        setLoading(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, searchLocation]);

  const handleLocationSelect = (location: any) => {
    setQuery(location.address);
    setShowSuggestions(false);
    onLocationSelect(location);
  };

  const handleCurrentLocation = async () => {
    const location = await detectCurrentLocation();
    if (location) {
      setQuery(location.address);
      onLocationSelect(location);
    }
  };

  const clearLocation = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onLocationSelect(null);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-8"
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          />
          {query && (
            <button
              onClick={clearLocation}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <Button
          variant="outline"
          onClick={handleCurrentLocation}
          disabled={locationLoading}
          className="flex items-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          {locationLoading ? 'Detecting...' : 'Current'}
        </Button>
      </div>

      {/* Current location indicator */}
      {currentLocation && (
        <div className="mt-2 p-2 bg-blue-50 rounded-lg flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-800">
            Using: {currentLocation.address}
          </span>
          <Badge variant="secondary" className="text-xs">Current Location</Badge>
        </div>
      )}

      {/* Location suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {loading && (
            <div className="p-3 text-center text-gray-500 text-sm">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                Searching locations...
              </div>
            </div>
          )}
          
          {suggestions.map((location, index) => (
            <button
              key={index}
              onClick={() => handleLocationSelect(location)}
              className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0 flex items-center gap-3"
            >
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div>
                <div className="font-medium text-sm">{location.address}</div>
                {location.city && location.state && (
                  <div className="text-xs text-gray-500">
                    {location.city}, {location.state}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearchInput;
