
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Listing {
  id: string;
  dog_name: string;
  breed: string;
  price: number;
  location: string;
  image_url?: string;
  coordinates?: { lat: number; lng: number };
}

interface ListingsOverlayProps {
  listings: Listing[];
  selectedListing?: Listing;
  onListingClick: (listing: Listing) => void;
  onClose: () => void;
}

const ListingsOverlay = ({ 
  listings, 
  selectedListing, 
  onListingClick, 
  onClose 
}: ListingsOverlayProps) => {
  return (
    <div className="absolute inset-0 bg-white bg-opacity-95 overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Listings ({listings.length})</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
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
            onClick={() => onListingClick(listing)}
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
  );
};

export default ListingsOverlay;
