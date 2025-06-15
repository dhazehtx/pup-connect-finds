
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useChatSearch } from '@/hooks/useChatSearch';
import { Message } from '@/types/chat';

interface ChatSearchBarProps {
  messages: Message[];
  onMessageSelect?: (messageIndex: number) => void;
  onClose?: () => void;
}

const ChatSearchBar = ({ messages, onMessageSelect, onClose }: ChatSearchBarProps) => {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    currentIndex,
    nextResult,
    previousResult,
    clearSearch,
    hasResults
  } = useChatSearch(messages);

  const handleNext = () => {
    const messageIndex = nextResult();
    if (messageIndex !== -1) {
      onMessageSelect?.(messageIndex);
    }
  };

  const handlePrevious = () => {
    const messageIndex = previousResult();
    if (messageIndex !== -1) {
      onMessageSelect?.(messageIndex);
    }
  };

  const handleClose = () => {
    clearSearch();
    onClose?.();
  };

  return (
    <div className="border-b bg-background p-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="pl-10 pr-4"
          />
        </div>

        {hasResults && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {currentIndex + 1} of {searchResults.length}
            </Badge>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={currentIndex <= 0}
              >
                <ChevronUp className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                disabled={currentIndex >= searchResults.length - 1}
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        <Button variant="ghost" size="sm" onClick={handleClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {searchQuery && !hasResults && (
        <p className="text-sm text-muted-foreground mt-2">
          No messages found matching "{searchQuery}"
        </p>
      )}
    </div>
  );
};

export default ChatSearchBar;
