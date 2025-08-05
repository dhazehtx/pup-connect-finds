import React from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';
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
      {/* Gesture hints removed for cleaner interface */}

      {/* Filter and Sort Bar */}
      <div className="flex items-center justify-between">
        {/* Filter Button */}
        <Button 
          onClick={onFilterOpen}
          className="flex items-center gap-2 border border-gray-400 text-gray-700 bg-white rounded-full px-6 py-2 hover:bg-gray-50 transition-colors"
        >
          <Filter className="h-4 w-4 text-gray-700" />
          Filter
          {hasActiveFilters && (
            <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
              !
            </span>
          )}
        </Button>
        
        {/* Regular Sort Button */}
        <select
          value={sortType}
          onChange={(e) => onSortChange(e.target.value as any)}
          className="flex items-center gap-2 border border-primary-600 text-primary-600 bg-white rounded-full px-6 py-2 hover:bg-primary-50 transition-colors cursor-pointer"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Price range filtering removed for cleaner interface */}
    </div>
  );
};

export default GestureFilterBar;