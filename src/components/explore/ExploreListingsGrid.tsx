
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, MessageCircle } from 'lucide-react';

interface TransformedListing {
  id: number;
  title: string;
  breed: string;
  age: string;
  location: string;
  distance: string;
  price: string;
  image: string;
  verified: boolean;
  sourceType?: string;
  rating: number;
  reviews: number;
  breeder: string;
  color?: string;
  gender?: string;
  verifiedBreeder?: boolean;
  idVerified?: boolean;
  vetVerified?: boolean;
  available?: number;
  isKillShelter?: boolean;
}

interface ExploreListingsGridProps {
  listings: TransformedListing[];
  favorites: Set<number>;
  onToggleFavorite: (listingId: number) => void;
  onContactSeller: (listing: TransformedListing) => void;
  onViewDetails: (listing: TransformedListing) => void;
}

const ExploreListingsGrid = ({ 
  listings, 
  favorites, 
  onToggleFavorite, 
  onContactSeller, 
  onViewDetails 
}: ExploreListingsGridProps) => {
  return (
    <div className="px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="relative">
              <img
                src={listing.image}
                alt={listing.title}
                className="w-full h-48 object-cover"
              />
              
              {/* Price badge */}
              <div className="absolute top-3 right-3">
                <Badge className="bg-black/70 text-white font-bold">
                  {listing.price}
                </Badge>
              </div>
              
              {/* Verification badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {listing.verified && (
                  <Badge className="bg-blue-600 text-white text-xs">
                    Verified
                  </Badge>
                )}
                {listing.sourceType === 'shelter' && (
                  <Badge className="bg-green-600 text-white text-xs">
                    Shelter
                  </Badge>
                )}
              </div>
              
              {/* Favorite button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-3 right-3 h-8 w-8 p-0 bg-white/90 hover:bg-white backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(listing.id);
                }}
              >
                <Heart 
                  className={`h-4 w-4 transition-colors ${
                    favorites.has(listing.id) ? "text-red-500 fill-current" : "text-gray-600"
                  }`} 
                />
              </Button>
            </div>
            
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg leading-tight">{listing.title}</h3>
                <p className="text-muted-foreground">{listing.breed}</p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{listing.age}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{listing.location}</span>
                </div>
                <span>•</span>
                <span>{listing.distance} mi</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">⭐ {listing.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ({listing.reviews} reviews)
                </span>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onContactSeller(listing);
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onViewDetails(listing)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExploreListingsGrid;
