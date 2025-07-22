
import React, { useState, useRef } from 'react';
import MapContainer from './MapContainer';
import MapControls from './MapControls';
import SelectedListingPopup from './SelectedListingPopup';
import ListingsOverlay from './ListingsOverlay';

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

  const handleMarkerClick = (listing: Listing) => {
    onListingSelect?.(listing);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 1, 1));
  };

  const handleToggleList = () => {
    setShowList(!showList);
  };

  return (
    <div className="relative h-96 w-full bg-gray-100 rounded-lg overflow-hidden">
      {/* Map container */}
      <div ref={mapRef}>
        <MapContainer
          listings={listings}
          selectedListing={selectedListing}
          userLocation={userLocation}
          onMarkerClick={handleMarkerClick}
        />
      </div>

      {/* Map controls */}
      <MapControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onToggleList={handleToggleList}
      />

      {/* Selected listing popup */}
      {selectedListing && (
        <SelectedListingPopup listing={selectedListing} />
      )}

      {/* Listings list overlay */}
      {showList && (
        <ListingsOverlay
          listings={listings}
          selectedListing={selectedListing}
          onListingClick={handleMarkerClick}
          onClose={() => setShowList(false)}
        />
      )}
    </div>
  );
};

export default ListingsMapView;
