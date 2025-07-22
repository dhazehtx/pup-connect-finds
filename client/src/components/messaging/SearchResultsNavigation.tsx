
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown, X } from 'lucide-react';

interface SearchResultsNavigationProps {
  currentIndex: number;
  totalResults: number;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
}

const SearchResultsNavigation = ({
  currentIndex,
  totalResults,
  onNext,
  onPrevious,
  onClose
}: SearchResultsNavigationProps) => {
  if (totalResults === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b">
      <Badge variant="secondary" className="text-xs">
        {currentIndex + 1} of {totalResults}
      </Badge>
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="h-6 w-6 p-0"
        >
          <ChevronUp className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={currentIndex === totalResults - 1}
          className="h-6 w-6 p-0"
        >
          <ChevronDown className="w-3 h-3" />
        </Button>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-6 w-6 p-0 ml-auto"
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
};

export default SearchResultsNavigation;
