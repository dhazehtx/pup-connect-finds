import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { Filter, ChevronDown, RotateCcw, ArrowUpDown, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SortType = 'featured' | 'price-low-high' | 'price-high-low' | 'rating';

interface GestureFilterBarProps {
  sortType: SortType;
  onSortChange: (sort: SortType) => void;
  onFilterOpen: () => void;
  hasActiveFilters: boolean;
  onPriceRangeChange: (min: number, max: number) => void;
  priceRange: { min: number; max: number };
}

const GestureFilterBar: React.FC<GestureFilterBarProps> = ({
  sortType,
  onSortChange,
  onFilterOpen,
  hasActiveFilters,
  onPriceRangeChange,
  priceRange
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showGestureHints, setShowGestureHints] = useState(true);

  const sortOptions: { value: SortType; label: string; icon: React.ReactNode }[] = [
    { value: 'featured', label: 'Featured', icon: <Heart className="w-4 h-4" /> },
    { value: 'price-low-high', label: 'Price ↑', icon: <ArrowUpDown className="w-4 h-4" /> },
    { value: 'price-high-low', label: 'Price ↓', icon: <ArrowUpDown className="w-4 h-4 rotate-180" /> },
    { value: 'rating', label: 'Rating', icon: <Heart className="w-4 h-4" /> }
  ];

  // Spring for sort indicator animation
  const [{ sortProgress }, sortApi] = useSpring(() => ({
    sortProgress: 0,
    config: { tension: 200, friction: 25 }
  }));

  // Removed price slider spring for cleaner interface

  // Horizontal swipe to change sort type
  const bindSortDrag = useDrag(({ active, movement: [mx], direction: [xDir], velocity: [vx] }) => {
    if (active) {
      setIsDragging(true);
      const progress = Math.abs(mx) / 100;
      sortApi.start({ sortProgress: Math.min(progress, 1) });
    } else {
      setIsDragging(false);
      
      if (Math.abs(mx) > 80 && Math.abs(vx) > 0.3) {
        const currentIndex = sortOptions.findIndex(opt => opt.value === sortType);
        let newIndex;
        
        if (xDir > 0) {
          // Swipe right - next sort option
          newIndex = (currentIndex + 1) % sortOptions.length;
        } else {
          // Swipe left - previous sort option
          newIndex = currentIndex === 0 ? sortOptions.length - 1 : currentIndex - 1;
        }
        
        onSortChange(sortOptions[newIndex].value);
      }
      
      sortApi.start({ sortProgress: 0 });
    }
  });

  // Removed pinch-to-zoom price adjustment to keep interface clean

  // Hide gesture hints after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGestureHints(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const currentSort = sortOptions.find(opt => opt.value === sortType);

  return (
    <div className="space-y-4">
      {/* Gesture Hints */}
      {showGestureHints && (
        <animated.div
          style={{
            opacity: showGestureHints ? 1 : 0
          }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700"
        >
          <div className="flex items-center gap-2 mb-2">
            <RotateCcw className="w-4 h-4" />
            <span className="font-medium">Gesture Controls</span>
          </div>
          <div className="space-y-1 text-xs">
            <div>• Swipe ← → on sort button to change sorting</div>
            <div>• Swipe cards ← → for quick actions</div>
          </div>
        </animated.div>
      )}

      {/* Filter and Sort Bar */}
      <div className="flex items-center justify-between">
        {/* Filter Button */}
        <Button 
          onClick={onFilterOpen}
          className="flex items-center gap-2 border border-primary-600 text-primary-600 bg-white rounded-full px-6 py-2 hover:bg-primary-50 transition-colors"
        >
          <Filter className="h-4 w-4" />
          Filter
          {hasActiveFilters && (
            <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
              !
            </span>
          )}
        </Button>
        
        {/* Gesture-enabled Sort Button */}
        <animated.div
          {...bindSortDrag()}
          style={{
            scale: sortProgress.to(p => 1 + p * 0.1),
            background: sortProgress.to(p => 
              p > 0.5 ? '#3b82f6' : 'white'
            ),
            color: sortProgress.to(p => 
              p > 0.5 ? 'white' : '#3b82f6'
            )
          }}
          className={`
            touch-none select-none cursor-grab active:cursor-grabbing
            flex items-center gap-2 border border-primary-600 rounded-full px-6 py-2 
            transition-all duration-200
            ${isDragging ? 'shadow-lg' : 'hover:bg-primary-50'}
          `}
        >
          {currentSort?.icon}
          <span className="font-medium">{currentSort?.label}</span>
          <ChevronDown className="h-4 w-4" />
          
          {/* Swipe indicator */}
          {isDragging && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-blue-600 font-medium">
              Swipe to change
            </div>
          )}
        </animated.div>
      </div>

      {/* Price range filtering removed for cleaner interface */}
    </div>
  );
};

export default GestureFilterBar;