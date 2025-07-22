
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface SearchResult {
  id: string;
  content: string;
  created_at: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  onResultSelect?: (messageId: string) => void;
  showResults: boolean;
}

const SearchResults = ({ results, onResultSelect, showResults }: SearchResultsProps) => {
  if (!showResults || results.length === 0 || !onResultSelect) {
    return null;
  }

  return (
    <div className="mt-2 max-h-40 overflow-y-auto">
      {results.slice(0, 5).map((message) => (
        <div
          key={message.id}
          className="p-2 hover:bg-muted/50 cursor-pointer rounded text-sm border-b last:border-b-0"
          onClick={() => onResultSelect(message.id)}
        >
          <p className="truncate">{message.content}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </p>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
