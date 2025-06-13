
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, MessageCircle, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeableListingCardProps {
  listing: {
    id: string;
    dog_name: string;
    breed: string;
    price: number;
    location: string;
    images: string[];
    age?: string;
  };
  onLike?: (listingId: string) => void;
  onMessage?: (listingId: string) => void;
  onShare?: (listingId: string) => void;
  className?: string;
}

const SwipeableListingCard = ({
  listing,
  onLike,
  onMessage,
  onShare,
  className
}: SwipeableListingCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(listing.id);
  };

  const handleImageChange = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === listing.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? listing.images.length - 1 : prev - 1
      );
    }
  };

  return (
    <Card className={cn("overflow-hidden touch-manipulation", className)}>
      <div className="relative">
        {/* Image carousel */}
        <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
          {listing.images.length > 0 ? (
            <>
              <img
                src={listing.images[currentImageIndex]}
                alt={listing.dog_name}
                className="w-full h-full object-cover"
              />
              
              {/* Image navigation dots */}
              {listing.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {listing.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        index === currentImageIndex 
                          ? "bg-white" 
                          : "bg-white/50"
                      )}
                    />
                  ))}
                </div>
              )}
              
              {/* Touch areas for swiping */}
              {listing.images.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageChange('prev')}
                    className="absolute left-0 top-0 w-1/3 h-full z-10"
                    aria-label="Previous image"
                  />
                  <button
                    onClick={() => handleImageChange('next')}
                    className="absolute right-0 top-0 w-1/3 h-full z-10"
                    aria-label="Next image"
                  />
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No image</span>
            </div>
          )}
        </div>

        {/* Like button overlay */}
        <button
          onClick={handleLike}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm touch-manipulation"
        >
          <Heart 
            className={cn(
              "w-5 h-5 transition-colors",
              isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
            )} 
          />
        </button>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div>
            <h3 className="font-bold text-lg">{listing.dog_name}</h3>
            <p className="text-muted-foreground">{listing.breed}</p>
          </div>

          {/* Details */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{listing.location}</span>
            </div>
            {listing.age && (
              <Badge variant="secondary" className="text-xs">
                {listing.age}
              </Badge>
            )}
          </div>

          {/* Price */}
          <div className="text-xl font-bold text-primary">
            ${listing.price.toLocaleString()}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMessage?.(listing.id)}
              className="flex-1"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare?.(listing.id)}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SwipeableListingCard;
