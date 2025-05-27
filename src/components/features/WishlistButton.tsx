
import React, { useState } from 'react';
import AnimatedHeart from '@/components/ui/animated-heart';
import SuccessIndicator from '@/components/ui/success-indicator';
import { useToast } from '@/hooks/use-toast';

interface WishlistButtonProps {
  listingId: number;
  listingTitle: string;
  isFavorited?: boolean;
  onToggleFavorite?: (id: number) => void;
}

const WishlistButton = ({ 
  listingId, 
  listingTitle, 
  isFavorited = false, 
  onToggleFavorite 
}: WishlistButtonProps) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const handleToggle = () => {
    onToggleFavorite?.(listingId);
    
    if (!isFavorited) {
      setShowSuccess(true);
      toast({
        title: "Added to Wishlist! 💝",
        description: `${listingTitle} has been saved to your favorites`,
      });
    } else {
      toast({
        title: "Removed from Wishlist",
        description: `${listingTitle} has been removed from your favorites`,
      });
    }
  };

  return (
    <>
      <AnimatedHeart 
        isLiked={isFavorited}
        onToggle={handleToggle}
        className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
      />
      <SuccessIndicator
        show={showSuccess}
        message="Added to your wishlist!"
        icon="paw"
        onComplete={() => setShowSuccess(false)}
      />
    </>
  );
};

export default WishlistButton;
