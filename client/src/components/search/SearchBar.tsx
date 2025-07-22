
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Heart } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onToggleFilters: () => void;
  onToggleSaveDialog: () => void;
  suggestions?: string[];
  onSuggestionSelect: (suggestion: string) => void;
}

const SearchBar = ({ 
  query, 
  onQueryChange, 
  onToggleFilters, 
  onToggleSaveDialog,
  suggestions = [],
  onSuggestionSelect 
}: SearchBarProps) => {
  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by breed, name, or location..."
            className="pl-10"
          />
          
          {/* Search Suggestions */}
          {suggestions.length > 0 && query && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestionSelect(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <Button
          variant="outline"
          onClick={onToggleFilters}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
        </Button>
        <Button
          variant="outline"
          onClick={onToggleSaveDialog}
          className="flex items-center gap-2"
        >
          <Heart className="w-4 h-4" />
          Save
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
