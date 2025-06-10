
import React from 'react';

interface SearchResultHighlightProps {
  text: string;
  searchQuery: string;
  className?: string;
}

const SearchResultHighlight = ({ text, searchQuery, className = '' }: SearchResultHighlightProps) => {
  if (!searchQuery.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (regex.test(part)) {
          return (
            <mark key={index} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
              {part}
            </mark>
          );
        }
        return part;
      })}
    </span>
  );
};

export default SearchResultHighlight;
