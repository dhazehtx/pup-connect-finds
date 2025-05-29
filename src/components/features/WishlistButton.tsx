
import React from 'react';
import AnimatedHeart from '@/components/ui/animated-heart';
import { useFavorites } from '@/hooks/useFavorites';
import { Loader2 } from 'lucide-react';

interface WishlistButtonProps {
  listingId: string;
  listingTitle: string;
  className?: string;
}

const WishlistButton = ({ 
  listingId, 
  listingTitle,
  className = "p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
}: WishlistButtonProps) => {
  const { toggleFavorite, isFavorited, isFavoritePending } = useFavorites();

  const handleToggle = async () => {
    await toggleFavorite(listingId);
  };

  const isPending = isFavoritePending(listingId);

  return (
    <div className={`relative ${className}`}>
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-full">
          <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
        </div>
      )}
      <AnimatedHeart 
        isLiked={isFavorited(listingId)}
        onToggle={handleToggle}
        className={isPending ? "opacity-50" : ""}
        disabled={isPending}
      />
    </div>
  );
};

export default WishlistButton;
