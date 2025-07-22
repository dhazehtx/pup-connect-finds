
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Listing {
  id: string;
  dog_name: string;
  breed: string;
  price: number;
  age: number;
  location: string;
  image_url?: string;
  description?: string;
  user_id: string;
  created_at: string;
}

interface ListingCardProps {
  listing: Listing;
  onContactSeller: (listing: Listing) => void;
  onAddToFavorites: (listing: Listing) => void;
  onAddToComparison: (listing: Listing) => void;
}

const ListingCard = ({ 
  listing, 
  onContactSeller, 
  onAddToFavorites, 
  onAddToComparison 
}: ListingCardProps) => {
  return (
    <div className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {listing.image_url && (
          <img 
            src={listing.image_url} 
            alt={listing.dog_name}
            className="w-24 h-24 rounded-lg object-cover"
          />
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{listing.dog_name}</h3>
              <p className="text-gray-600">{listing.breed}</p>
              <p className="text-sm text-gray-500">{listing.location}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">${listing.price}</p>
              <p className="text-sm text-gray-500">{listing.age} months old</p>
            </div>
          </div>
          
          <div className="flex gap-2 mt-3">
            <Button 
              size="sm" 
              onClick={() => onContactSeller(listing)}
            >
              Contact Seller
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onAddToFavorites(listing)}
            >
              ♡ Save
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onAddToComparison(listing)}
            >
              Compare
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
