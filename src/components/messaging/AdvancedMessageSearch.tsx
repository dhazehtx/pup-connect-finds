
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Calendar, User, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface AdvancedMessageSearchProps {
  messages: any[];
  onSearchResults: (results: any[]) => void;
  onClearSearch: () => void;
}

interface SearchFilters {
  query: string;
  sender: string;
  messageType: string;
  dateFrom?: Date;
  dateTo?: Date;
  hasMedia: boolean | null;
}

const AdvancedMessageSearch = ({ messages, onSearchResults, onClearSearch }: AdvancedMessageSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sender: '',
    messageType: '',
    hasMedia: null
  });

  console.log('🔍 AdvancedMessageSearch - Current filters:', filters);

  // Get unique senders for filter dropdown
  const uniqueSenders = useMemo(() => {
    const senders = new Map();
    messages.forEach(msg => {
      if (!senders.has(msg.sender_id)) {
        senders.set(msg.sender_id, {
          id: msg.sender_id,
          name: msg.sender_name || `User ${msg.sender_id.slice(0, 8)}`
        });
      }
    });
    return Array.from(senders.values());
  }, [messages]);

  // Perform search when filters change
  useEffect(() => {
    const performSearch = () => {
      console.log('🔍 AdvancedMessageSearch - Performing search with filters:', filters);
      
      let results = messages;

      // Text search
      if (filters.query.trim()) {
        const query = filters.query.toLowerCase();
        results = results.filter(msg => 
          msg.content?.toLowerCase().includes(query) ||
          msg.sender_name?.toLowerCase().includes(query)
        );
      }

      // Sender filter
      if (filters.sender) {
        results = results.filter(msg => msg.sender_id === filters.sender);
      }

      // Message type filter
      if (filters.messageType) {
        results = results.filter(msg => msg.message_type === filters.messageType);
      }

      // Date range filter
      if (filters.dateFrom) {
        results = results.filter(msg => 
          new Date(msg.created_at) >= filters.dateFrom!
        );
      }

      if (filters.dateTo) {
        results = results.filter(msg => 
          new Date(msg.created_at) <= filters.dateTo!
        );
      }

      // Media filter
      if (filters.hasMedia === true) {
        results = results.filter(msg => 
          msg.message_type === 'image' || 
          msg.message_type === 'voice' || 
          msg.image_url
        );
      } else if (filters.hasMedia === false) {
        results = results.filter(msg => 
          msg.message_type === 'text' && !msg.image_url
        );
      }

      console.log('🔍 AdvancedMessageSearch - Search results:', {
        totalMessages: messages.length,
        filteredResults: results.length
      });

      onSearchResults(results);
    };

    // Debounce search
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [filters, messages, onSearchResults]);

  const clearAllFilters = () => {
    console.log('🧹 AdvancedMessageSearch - Clearing all filters');
    setFilters({
      query: '',
      sender: '',
      messageType: '',
      hasMedia: null
    });
    onClearSearch();
  };

  const hasActiveFilters = () => {
    return filters.query || filters.sender || filters.messageType || 
           filters.dateFrom || filters.dateTo || filters.hasMedia !== null;
  };

  return (
    <div className="border-b p-4 space-y-3">
      {/* Main search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          value={filters.query}
          onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
          className="pl-10 pr-12"
        />
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">Advanced Filters</h4>
              
              {/* Sender filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Sender
                </label>
                <Select value={filters.sender} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, sender: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Any sender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any sender</SelectItem>
                    {uniqueSenders.map(sender => (
                      <SelectItem key={sender.id} value={sender.id}>
                        {sender.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Message type filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Message Type
                </label>
                <Select value={filters.messageType} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, messageType: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Any type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any type</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="voice">Voice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date range */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        {filters.dateFrom ? filters.dateFrom.toLocaleDateString() : 'From'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.dateFrom}
                        onSelect={(date) => setFilters(prev => ({ ...prev, dateFrom: date }))}
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        {filters.dateTo ? filters.dateTo.toLocaleDateString() : 'To'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.dateTo}
                        onSelect={(date) => setFilters(prev => ({ ...prev, dateTo: date }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Media filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Has Media</label>
                <div className="flex gap-2">
                  <Button
                    variant={filters.hasMedia === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      hasMedia: prev.hasMedia === true ? null : true 
                    }))}
                  >
                    With Media
                  </Button>
                  <Button
                    variant={filters.hasMedia === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      hasMedia: prev.hasMedia === false ? null : false 
                    }))}
                  >
                    Text Only
                  </Button>
                </div>
              </div>

              <Button onClick={clearAllFilters} variant="outline" className="w-full">
                Clear All Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filters display */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2">
          {filters.query && (
            <Badge variant="secondary">
              Text: "{filters.query}"
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0"
                onClick={() => setFilters(prev => ({ ...prev, query: '' }))}
              >
                ×
              </Button>
            </Badge>
          )}
          {filters.sender && (
            <Badge variant="secondary">
              Sender: {uniqueSenders.find(s => s.id === filters.sender)?.name}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0"
                onClick={() => setFilters(prev => ({ ...prev, sender: '' }))}
              >
                ×
              </Button>
            </Badge>
          )}
          {filters.messageType && (
            <Badge variant="secondary">
              Type: {filters.messageType}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0"
                onClick={() => setFilters(prev => ({ ...prev, messageType: '' }))}
              >
                ×
              </Button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdvancedMessageSearch;
