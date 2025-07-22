
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Layers, ZoomIn } from 'lucide-react';

interface SearchResultsMapProps {
  results: any[];
  selectedResult?: any;
  onResultSelect: (result: any) => void;
  userLocation?: any;
  className?: string;
}

const SearchResultsMap = ({ 
  results, 
  selectedResult, 
  onResultSelect, 
  userLocation,
  className = ""
}: SearchResultsMapProps) => {
  const [mapView, setMapView] = useState<'standard' | 'satellite'>('standard');
  const [showClusters, setShowClusters] = useState(true);

  // Mock map implementation - in production, integrate with Google Maps or similar
  const mockMapMarkers = results.map((result, index) => ({
    id: result.id || index,
    lat: 37.7749 + (Math.random() - 0.5) * 0.2, // Mock coordinates
    lng: -122.4194 + (Math.random() - 0.5) * 0.2,
    title: result.dog_name || result.title,
    price: result.price,
    image: result.image_url,
    verified: result.profiles?.verified || false
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Map View
            <Badge variant="secondary">{results.length} listings</Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMapView(mapView === 'standard' ? 'satellite' : 'standard')}
            >
              <Layers className="w-4 h-4 mr-1" />
              {mapView === 'standard' ? 'Satellite' : 'Standard'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClusters(!showClusters)}
            >
              <ZoomIn className="w-4 h-4 mr-1" />
              {showClusters ? 'Uncluster' : 'Cluster'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mock Map Container */}
        <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
          {/* Map background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" viewBox="0 0 400 400">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          </div>

          {/* User location marker */}
          {userLocation && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg">
                <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
          )}

          {/* Listing markers */}
          {mockMapMarkers.slice(0, 10).map((marker, index) => (
            <div
              key={marker.id}
              className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                selectedResult?.id === marker.id ? 'z-20' : 'z-10'
              }`}
              style={{
                left: `${30 + (index % 4) * 20}%`,
                top: `${25 + Math.floor(index / 4) * 15}%`
              }}
              onClick={() => onResultSelect(results[index])}
            >
              <div className={`relative ${
                selectedResult?.id === marker.id ? 'scale-125' : 'hover:scale-110'
              } transition-transform`}>
                <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold ${
                  marker.verified ? 'bg-green-600' : 'bg-red-600'
                }`}>
                  <MapPin className="w-4 h-4" />
                </div>
                
                {/* Price tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow-lg text-xs font-medium whitespace-nowrap">
                  ${marker.price?.toLocaleString() || 'N/A'}
                </div>
              </div>
            </div>
          ))}

          {/* Map controls */}
          <div className="absolute top-4 right-4 space-y-2">
            <Button size="sm" variant="outline" className="bg-white">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="bg-white">
              <Navigation className="w-4 h-4" />
            </Button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
            <div className="text-xs font-medium mb-2">Legend</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span>Verified Seller</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                <span>Unverified Seller</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span>Your Location</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected listing details */}
        {selectedResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex gap-4">
              <img
                src={selectedResult.image_url || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop'}
                alt={selectedResult.dog_name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="font-medium">{selectedResult.dog_name}</h4>
                <p className="text-sm text-gray-600">{selectedResult.breed}</p>
                <p className="text-lg font-semibold">${selectedResult.price?.toLocaleString()}</p>
                {selectedResult.profiles?.verified && (
                  <Badge variant="secondary" className="mt-1">Verified</Badge>
                )}
              </div>
              <div className="text-right">
                <Button size="sm">View Details</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchResultsMap;
