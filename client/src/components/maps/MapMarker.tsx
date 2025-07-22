
import React from 'react';

interface Listing {
  id: string;
  dog_name: string;
  breed: string;
  price: number;
  location: string;
  image_url?: string;
  coordinates?: { lat: number; lng: number };
}

interface MapMarkerProps {
  listing: Listing;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

const MapMarker = ({ listing, index, isSelected, onClick }: MapMarkerProps) => {
  return (
    <div
      className={`absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 ${
        isSelected ? 'scale-125' : ''
      }`}
      style={{
        left: `${20 + (index % 4) * 20}%`,
        top: `${30 + Math.floor(index / 4) * 40}%`
      }}
      onClick={onClick}
    >
      <div className={`w-full h-full rounded-full flex items-center justify-center text-white text-xs font-bold ${
        isSelected 
          ? 'bg-red-500 border-2 border-white' 
          : 'bg-blue-500'
      }`}>
        ${Math.floor(listing.price / 1000)}k
      </div>
    </div>
  );
};

export default MapMarker;
