
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navigation } from 'lucide-react';

interface Listing {
  id: string;
  dog_name: string;
  breed: string;
  price: number;
  location: string;
  image_url?: string;
  coordinates?: { lat: number; lng: number };
}

interface SelectedListingPopupProps {
  listing: Listing;
}

const SelectedListingPopup = ({ listing }: SelectedListingPopupProps) => {
  return (
    <div className="absolute bottom-4 left-4 right-4">
      <Card className="bg-white shadow-lg">
        <CardContent className="p-4">
          <div className="flex gap-3">
            {listing.image_url && (
              <img 
                src={listing.image_url} 
                alt={listing.dog_name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold">{listing.dog_name}</h3>
                <Badge variant="secondary">${listing.price}</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">{listing.breed}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Navigation className="w-3 h-3" />
                <span>{listing.location}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SelectedListingPopup;
