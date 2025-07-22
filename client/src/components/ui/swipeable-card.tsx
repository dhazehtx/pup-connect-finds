
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { useMobileOptimized } from '@/hooks/useMobileOptimized';
import { cn } from '@/lib/utils';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  className?: string;
  enableHapticFeedback?: boolean;
}

const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  className,
  enableHapticFeedback = true
}: SwipeableCardProps) => {
  const { isMobile } = useMobileOptimized();
  const [isPressed, setIsPressed] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const handleSwipeLeft = () => {
    if (enableHapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    setSwipeDirection('left');
    setTimeout(() => {
      onSwipeLeft?.();
      setSwipeDirection(null);
    }, 200);
  };

  const handleSwipeRight = () => {
    if (enableHapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    setSwipeDirection('right');
    setTimeout(() => {
      onSwipeRight?.();
      setSwipeDirection(null);
    }, 200);
  };

  const { onTouchStart, onTouchMove, onTouchEnd, isSwiping } = useSwipeGestures({
    threshold: 100,
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPressed(true);
    onTouchStart(e);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    onTouchEnd();
  };

  const handleClick = () => {
    if (!isSwiping && onTap) {
      onTap();
    }
  };

  if (!isMobile) {
    return (
      <Card className={cn("cursor-pointer hover:shadow-md transition-shadow", className)} onClick={onTap}>
        {children}
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "transition-all duration-200 touch-manipulation",
        isPressed && "scale-95 shadow-sm",
        swipeDirection === 'left' && "transform -translate-x-4 opacity-80",
        swipeDirection === 'right' && "transform translate-x-4 opacity-80",
        isSwiping && "select-none",
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {children}
      
      {/* Swipe indicators for mobile */}
      {isMobile && (onSwipeLeft || onSwipeRight) && (
        <div className="absolute top-2 right-2 flex gap-1">
          {onSwipeLeft && (
            <div className="w-2 h-2 bg-gray-300 rounded-full opacity-50" />
          )}
          {onSwipeRight && (
            <div className="w-2 h-2 bg-gray-300 rounded-full opacity-50" />
          )}
        </div>
      )}
    </Card>
  );
};

export default SwipeableCard;
