
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { useMessageSearch } from '@/hooks/useMessageSearch';
import { formatDistanceToNow } from 'date-fns';

interface AdvancedMessageSearchProps {
  conversationId?: string;
  onResultSelect?: (messageId: string) => void;
}

const AdvancedMessageSearch = ({ conversationId, onResultSelect }: AdvancedMessageSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedSender, setSelectedSender] = useState('');

  const { searchResults, isSearching, searchMessages, clearSearch } = useMessageSearch();

  const messageTypes = [
    { value: 'text', label: 'Text Messages' },
    { value: 'image', label: 'Images' },
    { value: 'voice', label: 'Voice Messages' },
    { value: 'file', label: 'Files' },
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;

    const filters: any = {};
    
    if (selectedTypes.length > 0) {
      filters.messageTypes = selectedTypes;
    }
    
    if (dateRange.start && dateRange.end) {
      filters.dateRange = dateRange;
    }
    
    if (selectedSender) {
      filters.sender = selectedSender;
    }

    await searchMessages(query, conversationId, filters);
  };

  const handleResultClick = (messageId: string) => {
    onResultSelect?.(messageId);
    setIsOpen(false);
  };

  const removeTypeFilter = (type: string) => {
    setSelectedTypes(prev => prev.filter(t => t !== type));
  };

  const clearAllFilters = () => {
    setSelectedTypes([]);
    setDateRange({ start: '', end: '' });
    setSelectedSender('');
    setQuery('');
    clearSearch();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Search className="w-4 h-4" />
          Advanced Search
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Advanced Message Search
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-shrink-0">
          {/* Search Query */}
          <div>
            <Label htmlFor="search-query">Search Query</Label>
            <div className="flex gap-2">
              <Input
                id="search-query"
                placeholder="Enter search terms..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>

          {/* Message Types Filter */}
          <div>
            <Label>Message Types</Label>
            <Select
              onValueChange={(value) => {
                if (!selectedTypes.includes(value)) {
                  setSelectedTypes(prev => [...prev, value]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select message types to filter" />
              </SelectTrigger>
              <SelectContent>
                {messageTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTypes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {messageTypes.find(t => t.value === type)?.label}
                    <button
                      onClick={() => removeTypeFilter(type)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={clearAllFilters}>
              Clear All Filters
            </Button>
            <span className="text-sm text-muted-foreground">
              {searchResults.length} results found
            </span>
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto space-y-2 mt-4">
          {searchResults.length === 0 && !isSearching && query && (
            <p className="text-center text-muted-foreground py-8">
              No messages found matching your search criteria.
            </p>
          )}
          
          {searchResults.map((result) => (
            <div
              key={result.id}
              className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => handleResultClick(result.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {result.content || 'No content preview'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {result.message_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedMessageSearch;
