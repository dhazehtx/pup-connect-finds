
import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedHeartProps {
  isLiked: boolean;
  onToggle: () => void;
  size?: number;
  className?: string;
}

const AnimatedHeart = ({ isLiked, onToggle, size = 24, className }: AnimatedHeartProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onToggle();
    
    // Reset animation state
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative transition-transform duration-150',
        isAnimating && 'animate-pulse',
        className
      )}
    >
      <Heart 
        size={size} 
        className={cn(
          'transition-all duration-200',
          isLiked 
            ? 'text-red-500 fill-current scale-110' 
            : 'text-gray-600 hover:text-red-400',
          isAnimating && 'animate-bounce'
        )} 
      />
      {isAnimating && isLiked && (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-red-500/20 rounded-full animate-ping" />
          </div>
          <div className="absolute -top-1 -right-1">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" />
          </div>
        </>
      )}
    </button>
  );
};

export default AnimatedHeart;
