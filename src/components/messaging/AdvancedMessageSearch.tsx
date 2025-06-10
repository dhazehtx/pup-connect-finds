
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, X, Calendar, User, FileText } from 'lucide-react';
import { useMessageSearch } from '@/hooks/useMessageSearch';
import { formatDistanceToNow } from 'date-fns';

interface AdvancedMessageSearchProps {
  messages: any[];
  onSearchResults: (results: any[]) => void;
  onClearSearch: () => void;
}

const AdvancedMessageSearch = ({
  messages,
  onSearchResults,
  onClearSearch
}: AdvancedMessageSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    messageTypes: [] as string[],
    dateRange: { start: '', end: '' },
    sender: ''
  });
  const [localResults, setLocalResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  console.log('🔍 AdvancedMessageSearch - Component rendered:', {
    searchQuery,
    messageCount: messages.length,
    hasFilters: Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f !== ''),
    resultsCount: localResults.length
  });

  // Local search function for instant results
  const performLocalSearch = useCallback((query: string, appliedFilters: typeof filters) => {
    if (!query.trim() && !Object.values(appliedFilters).some(f => Array.isArray(f) ? f.length > 0 : f !== '')) {
      setLocalResults([]);
      setShowResults(false);
      onClearSearch();
      return;
    }

    let results = messages.filter(message => {
      // Text search
      if (query.trim() && !message.content?.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }

      // Message type filter
      if (appliedFilters.messageTypes.length > 0 && !appliedFilters.messageTypes.includes(message.message_type)) {
        return false;
      }

      // Date range filter
      if (appliedFilters.dateRange.start && new Date(message.created_at) < new Date(appliedFilters.dateRange.start)) {
        return false;
      }
      if (appliedFilters.dateRange.end && new Date(message.created_at) > new Date(appliedFilters.dateRange.end)) {
        return false;
      }

      // Sender filter
      if (appliedFilters.sender && message.sender_id !== appliedFilters.sender) {
        return false;
      }

      return true;
    });

    // Sort by relevance (most recent first)
    results = results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    console.log('🔍 AdvancedMessageSearch - Search results:', {
      query,
      filters: appliedFilters,
      resultCount: results.length
    });

    setLocalResults(results);
    setShowResults(true);
    onSearchResults(results);
  }, [messages, onSearchResults, onClearSearch]);

  // Search as user types
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performLocalSearch(searchQuery, filters);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filters, performLocalSearch]);

  const handleClearSearch = () => {
    console.log('🧹 AdvancedMessageSearch - Clearing search');
    setSearchQuery('');
    setFilters({
      messageTypes: [],
      dateRange: { start: '', end: '' },
      sender: ''
    });
    setLocalResults([]);
    setShowResults(false);
    onClearSearch();
  };

  const toggleMessageType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      messageTypes: prev.messageTypes.includes(type)
        ? prev.messageTypes.filter(t => t !== type)
        : [...prev.messageTypes, type]
    }));
  };

  const hasActiveFilters = searchQuery.trim() !== '' || 
    filters.messageTypes.length > 0 || 
    filters.dateRange.start !== '' || 
    filters.dateRange.end !== '' || 
    filters.sender !== '';

  return (
    <div className="p-3 border-b bg-background">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="pl-8 pr-8"
          />
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
        
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="w-4 h-4" />
              Filters
              {Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f !== '') && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                  !
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Message Types</label>
                <div className="flex flex-wrap gap-1">
                  {['text', 'image', 'voice', 'file'].map((type) => (
                    <Button
                      key={type}
                      variant={filters.messageTypes.includes(type) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleMessageType(type)}
                      className="text-xs"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    placeholder="Start date"
                    className="text-sm"
                  />
                  <Input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    placeholder="End date"
                    className="text-sm"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({
                    messageTypes: [],
                    dateRange: { start: '', end: '' },
                    sender: ''
                  });
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Search Results Summary */}
      {showResults && (
        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>{localResults.length} messages found</span>
          {hasActiveFilters && (
            <div className="flex items-center gap-1">
              {filters.messageTypes.map(type => (
                <Badge key={type} variant="outline" className="text-xs">
                  {type}
                </Badge>
              ))}
              {filters.dateRange.start && (
                <Badge variant="outline" className="text-xs">
                  After {new Date(filters.dateRange.start).toLocaleDateString()}
                </Badge>
              )}
              {filters.dateRange.end && (
                <Badge variant="outline" className="text-xs">
                  Before {new Date(filters.dateRange.end).toLocaleDateString()}
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedMessageSearch;
