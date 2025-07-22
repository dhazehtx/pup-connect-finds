
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Calendar, User, FileText, X } from 'lucide-react';
import { useMessageSearch } from '@/hooks/useMessageSearch';
import { formatDistanceToNow } from 'date-fns';

interface MessageSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string;
  onMessageSelect: (messageId: string) => void;
}

const MessageSearchDialog = ({ 
  isOpen, 
  onClose, 
  conversationId, 
  onMessageSelect 
}: MessageSearchDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState('');
  const { searchResults, isSearching, searchMessages, clearSearch } = useMessageSearch();

  const filterOptions = [
    { id: 'text', label: 'Text Messages', icon: FileText },
    { id: 'image', label: 'Images', icon: FileText },
    { id: 'voice', label: 'Voice Messages', icon: FileText },
  ];

  useEffect(() => {
    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(() => {
        searchMessages(searchQuery, conversationId);
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      clearSearch();
    }
  }, [searchQuery, conversationId, searchMessages, clearSearch]);

  const handleFilterToggle = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleMessageClick = (messageId: string) => {
    onMessageSelect(messageId);
    onClose();
  };

  const filteredResults = searchResults.filter(result => {
    if (selectedFilters.length === 0) return true;
    return selectedFilters.includes(result.message_type);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search size={20} />
            Search Messages
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={selectedFilters.includes(id) ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterToggle(id)}
              className="h-8"
            >
              <Icon size={14} className="mr-1" />
              {label}
            </Button>
          ))}
        </div>

        {/* Results */}
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : filteredResults.length > 0 ? (
              filteredResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleMessageClick(result.id)}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2">
                        {result.content}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {result.message_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : searchQuery ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search size={48} className="mx-auto mb-4 opacity-50" />
                <p>No messages found</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search size={48} className="mx-auto mb-4 opacity-50" />
                <p>Start typing to search messages</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MessageSearchDialog;
