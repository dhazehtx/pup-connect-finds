
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, Calendar, User, FileText, Image, Mic } from 'lucide-react';
import { useMessageSearch } from '@/hooks/useMessageSearch';
import { formatDistanceToNow } from 'date-fns';

interface AdvancedMessageSearchProps {
  onMessageSelect: (messageId: string) => void;
}

const AdvancedMessageSearch = ({ onMessageSelect }: AdvancedMessageSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [senderFilter, setSenderFilter] = useState('');
  
  const { searchResults, isSearching, searchMessages, clearSearch } = useMessageSearch();

  const messageTypeFilters = [
    { id: 'text', label: 'Text', icon: FileText },
    { id: 'image', label: 'Images', icon: Image },
    { id: 'voice', label: 'Voice', icon: Mic },
  ];

  useEffect(() => {
    if (searchQuery.trim() || selectedFilters.length || dateRange.start || senderFilter) {
      const debounceTimer = setTimeout(() => {
        searchMessages(searchQuery, undefined, {
          messageTypes: selectedFilters,
          dateRange: dateRange.start && dateRange.end ? dateRange : undefined,
          sender: senderFilter || undefined
        });
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      clearSearch();
    }
  }, [searchQuery, selectedFilters, dateRange, senderFilter, searchMessages, clearSearch]);

  const handleFilterToggle = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedFilters([]);
    setDateRange({ start: '', end: '' });
    setSenderFilter('');
    clearSearch();
  };

  const activeFiltersCount = selectedFilters.length + 
    (dateRange.start ? 1 : 0) + 
    (senderFilter ? 1 : 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search size={20} />
          Advanced Message Search
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
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

        {/* Filters Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Filter size={16} />
              Filters
            </h4>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Clear all
              </Button>
            )}
          </div>

          {/* Message Type Filters */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Message Type</label>
            <div className="flex flex-wrap gap-2">
              {messageTypeFilters.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant={selectedFilters.includes(id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterToggle(id)}
                  className="h-8 text-xs"
                >
                  <Icon size={12} className="mr-1" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Calendar size={12} />
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="text-xs"
              />
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="text-xs"
              />
            </div>
          </div>

          {/* Sender Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <User size={12} />
              Sender
            </label>
            <Input
              value={senderFilter}
              onChange={(e) => setSenderFilter(e.target.value)}
              placeholder="Filter by sender name..."
              className="text-xs"
            />
          </div>
        </div>

        <Separator />

        {/* Results */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">
            Results ({searchResults.length})
          </h4>
          
          <ScrollArea className="h-64">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => onMessageSelect(result.id)}
                    className="p-2 border rounded cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-medium line-clamp-2">
                          {result.content}
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
            ) : (searchQuery || activeFiltersCount > 0) ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages found</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Enter search terms or apply filters</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedMessageSearch;
