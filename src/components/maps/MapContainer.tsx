
import React from 'react';
import { MapPin } from 'lucide-react';
import MapMarker from './MapMarker';

interface Listing {
  id: string;
  dog_name: string;
  breed: string;
  price: number;
  location: string;
  image_url?: string;
  coordinates?: { lat: number; lng: number };
}

interface MapContainerProps {
  listings: Listing[];
  selectedListing?: Listing;
  userLocation?: { lat: number; lng: number };
  onMarkerClick: (listing: Listing) => void;
}

const MapContainer = ({ 
  listings, 
  selectedListing, 
  userLocation, 
  onMarkerClick 
}: MapContainerProps) => {
  // Generate mock coordinates for demo
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

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
      <div className="text-center p-4">
        <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-600 mb-4">Interactive Map View</p>
        <p className="text-sm text-gray-500 mb-4">
          Showing {listings.length} listings in your area
        </p>
        
        {/* Simulated map markers */}
        <div className="relative w-full h-48 bg-white bg-opacity-50 rounded-lg">
          {listingsWithCoords.slice(0, 8).map((listing, index) => (
            <MapMarker
              key={listing.id}
              listing={listing}
              index={index}
              isSelected={selectedListing?.id === listing.id}
              onClick={() => onMarkerClick(listing)}
            />
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
  );
};

export default MapContainer;
