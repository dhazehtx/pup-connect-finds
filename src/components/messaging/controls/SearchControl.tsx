
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search } from 'lucide-react';
import AdvancedMessageSearch from '../AdvancedMessageSearch';

interface SearchControlProps {
  messages: any[];
  onSearchResults: (results: any[]) => void;
  onClearSearch: () => void;
}

const SearchControl = ({ messages, onSearchResults, onClearSearch }: SearchControlProps) => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <Popover open={showSearch} onOpenChange={setShowSearch}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Search className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <AdvancedMessageSearch
          messages={messages}
          onSearchResults={onSearchResults}
          onClearSearch={onClearSearch}
        />
      </PopoverContent>
    </Popover>
  );
};

export default SearchControl;
