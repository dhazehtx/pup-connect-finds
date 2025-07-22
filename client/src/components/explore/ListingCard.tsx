
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ListingCardProps {
  listing: {
    id: string;
    dog_name: string;
    breed: string;
    age: number;
    price: number;
    location?: string;
    image_url?: string;
    created_at: string;
    profiles?: {
      full_name?: string;
      verified?: boolean;
    };
  };
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

const ListingCard = ({ listing, onFavorite, isFavorited }: ListingCardProps) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite?.(listing.id);
  };

  return (
    <Link to={`/listing/${listing.id}`} className="block">
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white">
        <div className="aspect-square relative overflow-hidden">
          <img
            src={listing.image_url || '/placeholder.svg'}
            alt={listing.dog_name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 right-3 rounded-full bg-white/90 hover:bg-white ${
              isFavorited ? 'text-red-500' : 'text-gray-600'
            }`}
            onClick={handleFavoriteClick}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>
          <div className="absolute top-3 left-3">
            <Badge className="bg-[#2C3EDC] text-white hover:bg-[#2C3EDC]/90">
              ${listing.price?.toLocaleString()}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">{listing.dog_name}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="border-[#2C3EDC] text-[#2C3EDC]">
                {listing.breed}
              </Badge>
              <Badge variant="outline" className="text-gray-600">
                {listing.age} {listing.age === 1 ? 'month' : 'months'}
              </Badge>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            {listing.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{listing.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(listing.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {listing.profiles?.verified && (
            <div className="flex items-center gap-1 text-sm">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                ✓ Verified Seller
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default ListingCard;
