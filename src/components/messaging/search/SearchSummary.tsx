
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface SearchSummaryProps {
  resultCount: number;
  activeFilters: {
    messageTypes: string[];
    dateRange: {
      start: string;
      end: string;
    };
  };
  showResults: boolean;
}

const SearchSummary = ({ resultCount, activeFilters, showResults }: SearchSummaryProps) => {
  if (!showResults) return null;

  return (
    <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
      <span>{resultCount} messages found</span>
      <div className="flex items-center gap-1">
        {activeFilters.messageTypes.map(type => (
          <Badge key={type} variant="outline" className="text-xs">
            {type}
          </Badge>
        ))}
        {activeFilters.dateRange.start && (
          <Badge variant="outline" className="text-xs">
            After {new Date(activeFilters.dateRange.start).toLocaleDateString()}
          </Badge>
        )}
        {activeFilters.dateRange.end && (
          <Badge variant="outline" className="text-xs">
            Before {new Date(activeFilters.dateRange.end).toLocaleDateString()}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default SearchSummary;
