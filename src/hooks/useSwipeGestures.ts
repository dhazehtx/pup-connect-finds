
import { useState, useCallback } from 'react';

interface SwipeGesturesOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export const useSwipeGestures = ({
  threshold = 50,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown
}: SwipeGesturesOptions) => {
  const [startX, setStartX] = useState<number | null>(null);
  const [startY, setStartY] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setStartX(touch.clientX);
    setStartY(touch.clientY);
    setIsSwiping(false);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (startX === null || startY === null) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    // Check if we're swiping (moved more than a small threshold)
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      setIsSwiping(true);
    }
  }, [startX, startY]);

  const onTouchEnd = useCallback(() => {
    if (startX === null || startY === null) return;

    const currentTouch = document.elementFromPoint(startX, startY);
    if (!currentTouch) return;

    // Calculate final deltas
    const rect = (currentTouch as HTMLElement).getBoundingClientRect();
    const endX = rect.left + rect.width / 2;
    const endY = rect.top + rect.height / 2;
    
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    // Only trigger swipe if we moved enough
    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }

    setStartX(null);
    setStartY(null);
    setIsSwiping(false);
  }, [startX, startY, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isSwiping
  };
};
