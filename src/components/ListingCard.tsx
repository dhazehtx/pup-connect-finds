
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, MapPin, Star, Verified } from 'lucide-react';
import LazyImage from './performance/LazyImage';
import VerifiedBadges from './badges/VerifiedBadges';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  listing: any;
  onFavorite?: (id: string) => void;
  onContact?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  isFavorited?: boolean;
  showEnhancedActions?: boolean;
}

const ListingCard = ({
  listing,
  onFavorite,
  onContact,
  onViewDetails,
  isFavorited = false,
  showEnhancedActions = false
}: ListingCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(listing.id);
  };

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContact?.(listing.id);
  };

  const handleViewDetails = () => {
    onViewDetails?.(listing.id);
  };

  return (
    <Card 
      className="w-full overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={handleViewDetails}
    >
      <div className="relative">
        {/* Optimized Image with lazy loading */}
        <div className="aspect-[4/3] overflow-hidden">
          <LazyImage
            src={listing.image_url || '/placeholder.svg'}
            alt={listing.dog_name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Top badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {listing.profiles?.verified && (
              <Badge className="bg-blue-600 text-white text-xs">
                <Verified className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            {listing.status === 'urgent' && (
              <Badge className="bg-red-600 text-white text-xs">
                Urgent
              </Badge>
            )}
          </div>
          
          {/* Price */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-black/70 text-white font-bold">
              ${listing.price?.toLocaleString() || 'Contact'}
            </Badge>
          </div>
          
          {/* Favorite button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute bottom-3 right-3 h-8 w-8 p-0 bg-white/90 hover:bg-white backdrop-blur-sm"
            onClick={handleFavorite}
          >
            <Heart 
              className={cn(
                "h-4 w-4 transition-colors",
                isFavorited ? "text-red-500 fill-current" : "text-gray-600"
              )} 
            />
          </Button>
        </div>
        
        <CardContent className="p-4 space-y-3">
          {/* Title and breed with verified badges */}
          <div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg leading-tight">{listing.dog_name}</h3>
                <p className="text-muted-foreground">{listing.breed}</p>
              </div>
              <VerifiedBadges 
                isVerifiedBreeder={listing.profiles?.verified_breeder}
                hasVerifiedDelivery={listing.profiles?.verified_delivery}
                className="ml-2"
              />
            </div>
          </div>
          
          {/* Details */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {listing.age && <span>{listing.age} months</span>}
            {listing.age && <span>•</span>}
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{listing.profiles?.location || listing.location || 'Location not specified'}</span>
            </div>
          </div>
          
          {/* Rating */}
          {listing.profiles?.rating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{listing.profiles.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({listing.profiles.total_reviews || 0} reviews)
              </span>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleContact}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={handleViewDetails}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default ListingCard;
