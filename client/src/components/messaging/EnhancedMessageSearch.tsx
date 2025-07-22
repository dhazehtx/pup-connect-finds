
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, Calendar as CalendarIcon, User, FileText, Image } from 'lucide-react';

interface SearchFilters {
  query: string;
  sender: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  messageType: 'all' | 'text' | 'image' | 'file';
  hasAttachments: boolean;
}

interface EnhancedMessageSearchProps {
  messages: any[];
  onSearchResults: (results: any[]) => void;
  onClearSearch: () => void;
}

const EnhancedMessageSearch = ({ 
  messages, 
  onSearchResults, 
  onClearSearch 
}: EnhancedMessageSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sender: '',
    dateRange: { from: null, to: null },
    messageType: 'all',
    hasAttachments: false
  });

  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    if (filters.query.length > 2) {
      performSearch();
    } else if (filters.query.length === 0) {
      onClearSearch();
    }
  }, [filters]);

  const performSearch = async () => {
    setIsSearching(true);
    
    try {
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let results = messages.filter(message => {
        // Text search
        if (filters.query && !message.content?.toLowerCase().includes(filters.query.toLowerCase())) {
          return false;
        }
        
        // Sender filter
        if (filters.sender && !message.sender_name?.toLowerCase().includes(filters.sender.toLowerCase())) {
          return false;
        }
        
        // Date range filter
        if (filters.dateRange.from || filters.dateRange.to) {
          const messageDate = new Date(message.created_at);
          if (filters.dateRange.from && messageDate < filters.dateRange.from) return false;
          if (filters.dateRange.to && messageDate > filters.dateRange.to) return false;
        }
        
        // Message type filter
        if (filters.messageType !== 'all' && message.message_type !== filters.messageType) {
          return false;
        }
        
        // Attachments filter
        if (filters.hasAttachments && !message.image_url && !message.file_url) {
          return false;
        }
        
        return true;
      });

      // Sort by relevance (simple implementation)
      if (filters.query) {
        results = results.sort((a, b) => {
          const aRelevance = (a.content?.toLowerCase().match(new RegExp(filters.query.toLowerCase(), 'g')) || []).length;
          const bRelevance = (b.content?.toLowerCase().match(new RegExp(filters.query.toLowerCase(), 'g')) || []).length;
          return bRelevance - aRelevance;
        });
      }

      onSearchResults(results);
      
      // Add to search history
      if (filters.query && !searchHistory.includes(filters.query)) {
        setSearchHistory(prev => [filters.query, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearAllFilters = () => {
    setFilters({
      query: '',
      sender: '',
      dateRange: { from: null, to: null },
      messageType: 'all',
      hasAttachments: false
    });
    onClearSearch();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.query) count++;
    if (filters.sender) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.messageType !== 'all') count++;
    if (filters.hasAttachments) count++;
    return count;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Enhanced Message Search
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-1"
            >
              <Filter className="w-4 h-4" />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search messages..."
            value={filters.query}
            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
            className="pl-10"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Searches</h4>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((query, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => setFilters(prev => ({ ...prev, query }))}
                >
                  {query}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <Tabs defaultValue="filters" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="date">Date Range</TabsTrigger>
              <TabsTrigger value="type">Message Type</TabsTrigger>
            </TabsList>

            <TabsContent value="filters" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Sender</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Filter by sender name..."
                    value={filters.sender}
                    onChange={(e) => setFilters(prev => ({ ...prev, sender: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasAttachments"
                  checked={filters.hasAttachments}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasAttachments: e.target.checked }))}
                />
                <label htmlFor="hasAttachments" className="text-sm">
                  Only messages with attachments
                </label>
              </div>
            </TabsContent>

            <TabsContent value="date" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">From Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.from ? filters.dateRange.from.toDateString() : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.from || undefined}
                        onSelect={(date) => setFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, from: date || null }
                        }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">To Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.to ? filters.dateRange.to.toDateString() : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.to || undefined}
                        onSelect={(date) => setFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, to: date || null }
                        }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="type" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Message Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'all', label: 'All Messages', icon: FileText },
                    { value: 'text', label: 'Text Only', icon: FileText },
                    { value: 'image', label: 'Images', icon: Image },
                    { value: 'file', label: 'Files', icon: FileText }
                  ].map(type => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.value}
                        variant={filters.messageType === type.value ? 'default' : 'outline'}
                        onClick={() => setFilters(prev => ({ ...prev, messageType: type.value as any }))}
                        className="flex items-center gap-2 justify-start"
                      >
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedMessageSearch;
