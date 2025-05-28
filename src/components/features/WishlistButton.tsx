
import React from 'react';
import AnimatedHeart from '@/components/ui/animated-heart';
import { useFavorites } from '@/hooks/useFavorites';

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
  const { toggleFavorite, isFavorited } = useFavorites();

  const handleToggle = async () => {
    await toggleFavorite(listingId);
  };

  return (
    <AnimatedHeart 
      isLiked={isFavorited(listingId)}
      onToggle={handleToggle}
      className={className}
    />
  );
};

export default WishlistButton;
