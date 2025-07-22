
import React from 'react';
import { MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface MapPlaceholderProps {
  onLocationSearch?: (location: string) => void;
  markers?: Array<{
    id: string;
    lat: number;
    lng: number;
    title: string;
    price?: string;
  }>;
  className?: string;
}

const MapPlaceholder = ({ 
  onLocationSearch, 
  markers = [], 
  className = "" 
}: MapPlaceholderProps) => {
  const [searchLocation, setSearchLocation] = React.useState('');

  const handleLocationSearch = () => {
    if (searchLocation.trim() && onLocationSearch) {
      onLocationSearch(searchLocation.trim());
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {/* Search Bar */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Search location (e.g., San Francisco, CA)"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
          />
          <Button onClick={handleLocationSearch} size="sm">
            <Search size={16} />
          </Button>
        </div>

        {/* Map Placeholder */}
        <div className="relative h-64 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-blue-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Interactive Map</h3>
            <p className="text-gray-500 text-sm">Map integration coming soon</p>
            {markers.length > 0 && (
              <p className="text-gray-400 text-xs mt-1">Showing {markers.length} listings</p>
            )}
          </div>
          
          {/* Mock pins for visual representation */}
          {markers.slice(0, 5).map((marker, index) => (
            <div
              key={marker.id}
              className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
              style={{
                top: `${20 + (index * 15)}%`,
                left: `${20 + (index * 20)}%`,
              }}
              title={`${marker.title} - ${marker.price || 'Price not available'}`}
            />
          ))}
        </div>

        {/* Map Controls */}
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
          <div>Radius: 25 miles</div>
          <div>{markers.length} results found</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapPlaceholder;
