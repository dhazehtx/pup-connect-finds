
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchInputProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  loading?: boolean;
  onKeyPress?: (e: React.KeyboardEvent) => void;
}

const SearchInput = ({ query, onQueryChange, onSearch, loading, onKeyPress }: SearchInputProps) => {
  return (
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search by dog name, breed, or description..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-10"
          onKeyPress={onKeyPress}
        />
      </div>
      <Button 
        onClick={onSearch} 
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Search className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default SearchInput;
