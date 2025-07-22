
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

const StarRating = ({ 
  rating, 
  maxRating = 5, 
  size = 'md', 
  interactive = false,
  onRatingChange 
}: StarRatingProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const starSize = sizeClasses[size];

  const handleStarClick = (starIndex: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const isFilled = index < rating;
        const isHalfFilled = index === Math.floor(rating) && rating % 1 !== 0;
        
        return (
          <button
            key={index}
            onClick={() => handleStarClick(index)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`${starSize} ${
                isFilled 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : isHalfFilled 
                    ? 'fill-yellow-200 text-yellow-400'
                    : 'fill-transparent text-gray-300'
              }`}
            />
          </button>
        );
      })}
      {!interactive && (
        <span className="ml-2 text-sm text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
