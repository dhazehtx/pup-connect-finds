
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Calendar, User, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMessageSearch } from '@/hooks/useMessageSearch';
import { formatDistanceToNow } from 'date-fns';

interface AdvancedMessageSearchProps {
  conversationId?: string;
  onMessageSelect?: (messageId: string) => void;
}

const AdvancedMessageSearch = ({ conversationId, onMessageSelect }: AdvancedMessageSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    messageType: '',
    dateRange: '',
    sender: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const { searchResults, isSearching, searchMessages, clearSearch } = useMessageSearch();

  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        searchMessages(searchQuery, conversationId);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      clearSearch();
    }
  }, [searchQuery, conversationId, searchMessages, clearSearch]);

  const handleFilterChange = (filterType: string, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setSearchFilters({
      messageType: '',
      dateRange: '',
      sender: ''
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(searchFilters).filter(value => value !== '').length;
  };

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search messages..."
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Filter size={14} />
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Search Filters</h4>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Message Type</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded"
                      value={searchFilters.messageType}
                      onChange={(e) => handleFilterChange('messageType', e.target.value)}
                    >
                      <option value="">All types</option>
                      <option value="text">Text</option>
                      <option value="image">Images</option>
                      <option value="voice">Voice</option>
                      <option value="file">Files</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Date Range</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded"
                      value={searchFilters.dateRange}
                      onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    >
                      <option value="">All time</option>
                      <option value="today">Today</option>
                      <option value="week">This week</option>
                      <option value="month">This month</option>
                    </select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {searchQuery && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSearchQuery('')}
            >
              <X size={14} />
            </Button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Search Results {searchResults.length > 0 && `(${searchResults.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-60 overflow-y-auto space-y-2">
            {isSearching ? (
              <div className="text-center py-4 text-gray-500">
                Searching...
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No messages found
              </div>
            ) : (
              searchResults.map((message) => (
                <div
                  key={message.id}
                  className="p-3 border rounded cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onMessageSelect?.(message.id)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      <span className="text-sm font-medium">
                        {message.sender_id}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {highlightSearchTerm(message.content, searchQuery)}
                  </p>
                  {message.message_type !== 'text' && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {message.message_type}
                    </Badge>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedMessageSearch;
