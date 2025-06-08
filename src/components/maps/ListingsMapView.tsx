
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, ZoomIn, ZoomOut, List } from 'lucide-react';

interface Listing {
  id: string;
  dog_name: string;
  breed: string;
  price: number;
  location: string;
  image_url?: string;
  coordinates?: { lat: number; lng: number };
}

interface ListingsMapViewProps {
  listings: Listing[];
  onListingSelect?: (listing: Listing) => void;
  selectedListing?: Listing;
  userLocation?: { lat: number; lng: number };
}

const ListingsMapView = ({ 
  listings, 
  onListingSelect, 
  selectedListing, 
  userLocation 
}: ListingsMapViewProps) => {
  const [showList, setShowList] = useState(false);
  const [zoom, setZoom] = useState(12);
  const mapRef = useRef<HTMLDivElement>(null);

  // Simulate map markers for demo
  const generateMockCoordinates = (index: number) => {
    const baseLatitude = userLocation?.lat || 40.7128;
    const baseLongitude = userLocation?.lng || -74.0060;
    return {
      lat: baseLatitude + (Math.random() - 0.5) * 0.1,
      lng: baseLongitude + (Math.random() - 0.5) * 0.1
    };
  };

  const listingsWithCoords = listings.map((listing, index) => ({
    ...listing,
    coordinates: listing.coordinates || generateMockCoordinates(index)
  }));

  const handleMarkerClick = (listing: Listing) => {
    onListingSelect?.(listing);
  };

  return (
    <div className="relative h-96 w-full bg-gray-100 rounded-lg overflow-hidden">
      {/* Map placeholder */}
      <div 
        ref={mapRef}
        className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center"
      >
        <div className="text-center p-4">
          <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600 mb-4">Interactive Map View</p>
          <p className="text-sm text-gray-500 mb-4">
            Showing {listings.length} listings in your area
          </p>
          
          {/* Simulated map markers */}
          <div className="relative w-full h-48 bg-white bg-opacity-50 rounded-lg">
            {listingsWithCoords.slice(0, 8).map((listing, index) => (
              <div
                key={listing.id}
                className={`absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 ${
                  selectedListing?.id === listing.id ? 'scale-125' : ''
                }`}
                style={{
                  left: `${20 + (index % 4) * 20}%`,
                  top: `${30 + Math.floor(index / 4) * 40}%`
                }}
                onClick={() => handleMarkerClick(listing)}
              >
                <div className={`w-full h-full rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  selectedListing?.id === listing.id 
                    ? 'bg-red-500 border-2 border-white' 
                    : 'bg-blue-500'
                }`}>
                  ${Math.floor(listing.price / 1000)}k
                </div>
              </div>
            ))}
            
            {/* User location marker */}
            {userLocation && (
              <div 
                className="absolute w-4 h-4 bg-green-500 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: '50%', top: '50%' }}
                title="Your location"
              >
                <div className="w-full h-full bg-green-500 rounded-full animate-ping opacity-75"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoom(prev => Math.min(prev + 1, 18))}
          className="w-10 h-10 p-0 bg-white"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoom(prev => Math.max(prev - 1, 1))}
          className="w-10 h-10 p-0 bg-white"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowList(!showList)}
          className="w-10 h-10 p-0 bg-white"
        >
          <List className="w-4 h-4" />
        </Button>
      </div>

      {/* Selected listing popup */}
      {selectedListing && (
        <div className="absolute bottom-4 left-4 right-4">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex gap-3">
                {selectedListing.image_url && (
                  <img 
                    src={selectedListing.image_url} 
                    alt={selectedListing.dog_name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">{selectedListing.dog_name}</h3>
                    <Badge variant="secondary">${selectedListing.price}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{selectedListing.breed}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Navigation className="w-3 h-3" />
                    <span>{selectedListing.location}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Listings list overlay */}
      {showList && (
        <div className="absolute inset-0 bg-white bg-opacity-95 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Listings ({listings.length})</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowList(false)}>
              Close
            </Button>
          </div>
          <div className="space-y-2">
            {listings.map((listing) => (
              <Card 
                key={listing.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  selectedListing?.id === listing.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleMarkerClick(listing)}
              >
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    {listing.image_url && (
                      <img 
                        src={listing.image_url} 
                        alt={listing.dog_name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{listing.dog_name}</span>
                        <Badge variant="outline">${listing.price}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{listing.breed}</p>
                      <p className="text-xs text-gray-500">{listing.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingsMapView;
