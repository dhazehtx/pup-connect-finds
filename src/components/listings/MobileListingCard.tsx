
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, MapPin, Star, Verified } from 'lucide-react';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { cn } from '@/lib/utils';

interface MobileListingCardProps {
  listing: any;
  onFavorite: (id: string) => void;
  onContact: (id: string) => void;
  onViewDetails: (id: string) => void;
  isFavorited: boolean;
  showEnhancedActions?: boolean;
}

const MobileListingCard = ({
  listing,
  onFavorite,
  onContact,
  onViewDetails,
  isFavorited,
  showEnhancedActions = false
}: MobileListingCardProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isSwiping
  } = useSwipeGestures({
    onSwipeLeft: () => onFavorite(listing.id),
    onSwipeRight: () => onContact(listing.id),
    threshold: 100
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPressed(true);
    onTouchStart(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    onTouchMove(e);
    // Update visual feedback based on swipe
    if (isSwiping) {
      setSwipeOffset(Math.min(20, 20));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPressed(false);
    setSwipeOffset(0);
    onTouchEnd();
  };

  return (
    <Card 
      className={cn(
        "w-full overflow-hidden transition-all duration-200",
        isPressed && "scale-98 shadow-lg",
        isSwiping && "bg-blue-50 border-blue-200"
      )}
      style={{ transform: `translateX(${swipeOffset}px)` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative">
        {/* Image */}
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={listing.image_url || '/placeholder.svg'}
            alt={listing.dog_name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* Quick Action Overlay */}
          {isSwiping && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-blue-400">
              <Heart className="h-12 w-12" fill="currentColor" />
            </div>
          )}
          
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
              ${listing.price.toLocaleString()}
            </Badge>
          </div>
          
          {/* Favorite button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute bottom-3 right-3 h-8 w-8 p-0 bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(listing.id);
            }}
          >
            <Heart 
              className={cn(
                "h-4 w-4",
                isFavorited ? "text-red-500 fill-current" : "text-gray-600"
              )} 
            />
          </Button>
        </div>
        
        <CardContent className="p-4 space-y-3">
          {/* Title and breed */}
          <div>
            <h3 className="font-semibold text-lg leading-tight">{listing.dog_name}</h3>
            <p className="text-muted-foreground">{listing.breed}</p>
          </div>
          
          {/* Details */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{listing.age} months</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{listing.profiles?.location || 'Location not specified'}</span>
            </div>
          </div>
          
          {/* Rating */}
          {listing.profiles?.rating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{listing.profiles.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({listing.profiles.total_reviews} reviews)
              </span>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onContact(listing.id)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onViewDetails(listing.id)}
            >
              View Details
            </Button>
          </div>
          
          {/* Swipe hint */}
          <div className="text-center text-xs text-muted-foreground pt-1">
            ← Swipe for favorite | Swipe for contact →
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default MobileListingCard;
