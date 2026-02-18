import React, { memo } from 'react';
import { AnimatedListItem } from '@/components/ui/AnimatedListItem';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useImageLazyLoading } from '@/hooks/useImageLazyLoading';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    breed: string;
    price: number;
    location: string;
    image_url?: string;
    thumbUrls?: string[];
    seller_name?: string;
    age?: string;
    gender?: string;
  };
  index: number;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
  className?: string;
}

export const OptimizedListingCard = memo<ListingCardProps>(({
  listing,
  index,
  onFavorite,
  isFavorited = false,
  className
}) => {
  const feedImage = listing.thumbUrls?.[0] || listing.image_url || '/placeholder-dog.jpg';
  const { imgRef, src: imageSrc, isLoaded, hasError } = useImageLazyLoading(feedImage);

  return (
    <AnimatedListItem index={index} className={cn('w-full', className)}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-100">
          {!isLoaded && !hasError && (
            <Skeleton className="absolute inset-0" />
          )}
          
          <img
            ref={imgRef}
            src={imageSrc}
            alt={`${listing.breed} - ${listing.title}`}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
            loading={index < 6 ? 'eager' : 'lazy'}
          />

          {/* Favorite Button */}
          {onFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFavorite(listing.id);
              }}
              className={cn(
                "absolute top-2 right-2 p-2 rounded-full bg-white/90 shadow-sm transition-colors",
                isFavorited ? 'hover:bg-red-50' : 'hover:bg-white'
              )}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                size={16}
                className={cn(
                  'transition-colors',
                  isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'
                )}
              />
            </button>
          )}

          {/* Price Badge */}
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-sm font-semibold rounded">
            ${listing.price.toLocaleString()}
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
            {listing.title}
          </h3>
          
          <div className="text-xs text-gray-600 space-y-1">
            <div className="font-medium">{listing.breed}</div>
            
            {(listing.age || listing.gender) && (
              <div className="flex gap-2">
                {listing.age && <span>{listing.age}</span>}
                {listing.age && listing.gender && <span>•</span>}
                {listing.gender && <span>{listing.gender}</span>}
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <MapPin size={12} />
              <span className="truncate">{listing.location}</span>
            </div>
            
            {listing.seller_name && (
              <div className="text-gray-500">by {listing.seller_name}</div>
            )}
          </div>
        </div>
      </div>
    </AnimatedListItem>
  );
});

OptimizedListingCard.displayName = 'OptimizedListingCard';