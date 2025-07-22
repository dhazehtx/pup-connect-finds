
import React from 'react';

interface SearchSuggestionsDropdownProps {
  suggestions: string[];
  query: string;
  onSuggestionSelect: (suggestion: string) => void;
}

const SearchSuggestionsDropdown = ({ 
  suggestions, 
  query, 
  onSuggestionSelect 
}: SearchSuggestionsDropdownProps) => {
  if (suggestions.length === 0 || !query) return null;

  return (
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
  );
};

export default SearchSuggestionsDropdown;
