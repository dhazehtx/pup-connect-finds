
import React from 'react';
import { Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface Favorite {
  id: string;
  listing_id: string;
  created_at: string;
  listing?: {
    id: string;
    dog_name: string;
    breed: string;
    age: number;
    price: number;
    image_url: string | null;
    status: string;
  };
}

interface FavoritesListProps {
  favorites: Favorite[];
  onRemoveFavorite: (listingId: string) => void;
  onViewListing: (listingId: string) => void;
}

const FavoritesList = ({ favorites, onRemoveFavorite, onViewListing }: FavoritesListProps) => {
  if (favorites.length === 0) {
    return (
      <div className="p-8 text-center">
        <Heart size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="font-medium text-black mb-2">No favorites yet</h3>
        <p className="text-sm text-gray-500">
          Start browsing and tap the heart icon to save listings you love.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 p-4">
      {favorites.map((favorite) => {
        const listing = favorite.listing;
        if (!listing) return null;

        return (
          <div
            key={favorite.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <div className="flex">
              {listing.image_url && (
                <img
                  src={listing.image_url}
                  alt={listing.dog_name}
                  className="w-24 h-24 object-cover"
                />
              )}
              
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-black">{listing.dog_name}</h3>
                    <p className="text-sm text-gray-600">{listing.breed}</p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveFavorite(listing.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Heart size={20} fill="currentColor" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">
                    {listing.age} months
                  </Badge>
                  <Badge 
                    variant={listing.status === 'active' ? 'default' : 'secondary'}
                    className={listing.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {listing.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-black">
                    ${listing.price.toLocaleString()}
                  </span>
                  
                  <div className="text-xs text-gray-500">
                    Saved {formatDistanceToNow(new Date(favorite.created_at), { addSuffix: true })}
                  </div>
                </div>
                
                <Button
                  onClick={() => onViewListing(listing.id)}
                  className="w-full mt-3 bg-blue-500 hover:bg-blue-600"
                  disabled={listing.status !== 'active'}
                >
                  {listing.status === 'active' ? 'View Listing' : 'No Longer Available'}
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FavoritesList;
