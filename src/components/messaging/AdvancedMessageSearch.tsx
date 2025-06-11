
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  FileText,
  Image,
  Mic,
  Video,
  User,
  Hash,
  X,
  Download,
  Bookmark
} from 'lucide-react';
import { useMessageSearch } from '@/hooks/useMessageSearch';
import { format } from 'date-fns';

interface AdvancedMessageSearchProps {
  messages: any[];
  onSearchResults: (results: any[]) => void;
  onClearSearch: () => void;
  conversationId?: string;
}

interface SearchFilters {
  query: string;
  messageType: string;
  sender: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  hasAttachments: boolean;
  isStarred: boolean;
  tags: string[];
}

const AdvancedMessageSearch = ({ 
  messages, 
  onSearchResults, 
  onClearSearch, 
  conversationId 
}: AdvancedMessageSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    messageType: 'all',
    sender: 'all',
    dateRange: { from: null, to: null },
    hasAttachments: false,
    isStarred: false,
    tags: []
  });
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { searchResults, searching, searchMessages } = useMessageSearch();

  const messageTypes = [
    { value: 'all', label: 'All Messages', icon: FileText },
    { value: 'text', label: 'Text', icon: FileText },
    { value: 'image', label: 'Images', icon: Image },
    { value: 'voice', label: 'Voice', icon: Mic },
    { value: 'video', label: 'Video', icon: Video }
  ];

  const senders = useMemo(() => {
    const uniqueSenders = new Set(messages.map(msg => msg.sender_id));
    return [
      { value: 'all', label: 'All Senders' },
      ...Array.from(uniqueSenders).map(senderId => ({
        value: senderId,
        label: messages.find(msg => msg.sender_id === senderId)?.sender_name || 'Unknown'
      }))
    ];
  }, [messages]);

  const performSearch = useCallback(async () => {
    let results = messages;

    // Text search
    if (filters.query.trim()) {
      if (conversationId) {
        await searchMessages(filters.query, conversationId);
        results = searchResults;
      } else {
        results = results.filter(msg => 
          msg.content?.toLowerCase().includes(filters.query.toLowerCase())
        );
      }
    }

    // Message type filter
    if (filters.messageType !== 'all') {
      results = results.filter(msg => msg.message_type === filters.messageType);
    }

    // Sender filter
    if (filters.sender !== 'all') {
      results = results.filter(msg => msg.sender_id === filters.sender);
    }

    // Date range filter
    if (filters.dateRange.from) {
      results = results.filter(msg => 
        new Date(msg.created_at) >= filters.dateRange.from!
      );
    }
    if (filters.dateRange.to) {
      results = results.filter(msg => 
        new Date(msg.created_at) <= filters.dateRange.to!
      );
    }

    // Attachments filter
    if (filters.hasAttachments) {
      results = results.filter(msg => 
        msg.image_url || msg.message_type !== 'text'
      );
    }

    // Starred filter
    if (filters.isStarred) {
      results = results.filter(msg => msg.is_starred);
    }

    // Tags filter
    if (filters.tags.length > 0) {
      results = results.filter(msg => 
        filters.tags.some(tag => msg.tags?.includes(tag))
      );
    }

    onSearchResults(results);

    // Add to search history
    if (filters.query.trim() && !searchHistory.includes(filters.query)) {
      setSearchHistory(prev => [filters.query, ...prev.slice(0, 9)]);
    }
  }, [filters, messages, conversationId, searchMessages, searchResults, onSearchResults, searchHistory]);

  const clearAllFilters = () => {
    setFilters({
      query: '',
      messageType: 'all',
      sender: 'all',
      dateRange: { from: null, to: null },
      hasAttachments: false,
      isStarred: false,
      tags: []
    });
    onClearSearch();
  };

  const saveCurrentSearch = () => {
    const searchName = prompt('Enter a name for this search:');
    if (searchName) {
      const savedSearch = {
        id: Date.now().toString(),
        name: searchName,
        filters: { ...filters },
        created_at: new Date().toISOString()
      };
      setSavedSearches(prev => [...prev, savedSearch]);
    }
  };

  const loadSavedSearch = (search: any) => {
    setFilters(search.filters);
  };

  const exportResults = () => {
    const results = searchResults.length > 0 ? searchResults : messages;
    const csv = results.map(msg => 
      `"${msg.created_at}","${msg.sender_name || 'Unknown'}","${msg.content}","${msg.message_type}"`
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'message-search-results.csv';
    a.click();
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Advanced Message Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            {/* Basic Search */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search messages..."
                  value={filters.query}
                  onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                />
              </div>
              <Button onClick={performSearch} disabled={searching}>
                <Search className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Message Type */}
                  <div>
                    <Label>Message Type</Label>
                    <Select
                      value={filters.messageType}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, messageType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {messageTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="w-4 h-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sender */}
                  <div>
                    <Label>Sender</Label>
                    <Select
                      value={filters.sender}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, sender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {senders.map(sender => (
                          <SelectItem key={sender.value} value={sender.value}>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {sender.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range */}
                  <div>
                    <Label>Date From</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateRange.from ? format(filters.dateRange.from, "PPP") : "Pick a date"}
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>Date To</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateRange.to ? format(filters.dateRange.to, "PPP") : "Pick a date"}
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Boolean Filters */}
                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="attachments"
                      checked={filters.hasAttachments}
                      onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasAttachments: checked }))}
                    />
                    <Label htmlFor="attachments">Has Attachments</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="starred"
                      checked={filters.isStarred}
                      onCheckedChange={(checked) => setFilters(prev => ({ ...prev, isStarred: checked }))}
                    />
                    <Label htmlFor="starred">Starred Only</Label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button onClick={performSearch} disabled={searching}>
                    Search
                  </Button>
                  <Button variant="outline" onClick={clearAllFilters}>
                    Clear All
                  </Button>
                  <Button variant="outline" onClick={saveCurrentSearch}>
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save Search
                  </Button>
                  <Button variant="outline" onClick={exportResults}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            )}

            {/* Active Filters */}
            {(filters.query || filters.messageType !== 'all' || filters.sender !== 'all' || 
              filters.hasAttachments || filters.isStarred) && (
              <div className="flex flex-wrap gap-2">
                {filters.query && (
                  <Badge variant="secondary">
                    Query: {filters.query}
                    <X 
                      className="w-3 h-3 ml-1 cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, query: '' }))}
                    />
                  </Badge>
                )}
                {filters.messageType !== 'all' && (
                  <Badge variant="secondary">
                    Type: {filters.messageType}
                    <X 
                      className="w-3 h-3 ml-1 cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, messageType: 'all' }))}
                    />
                  </Badge>
                )}
                {filters.hasAttachments && (
                  <Badge variant="secondary">
                    Has Attachments
                    <X 
                      className="w-3 h-3 ml-1 cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, hasAttachments: false }))}
                    />
                  </Badge>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-2">
            <div className="text-sm text-gray-600 mb-2">Recent Searches</div>
            {searchHistory.map((query, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                <span>{query}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setFilters(prev => ({ ...prev, query }))}
                >
                  Use
                </Button>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="saved" className="space-y-2">
            <div className="text-sm text-gray-600 mb-2">Saved Searches</div>
            {savedSearches.map((search) => (
              <div key={search.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                <div>
                  <div className="font-medium">{search.name}</div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(search.created_at), 'PPP')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => loadSavedSearch(search)}
                  >
                    Load
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSavedSearches(prev => prev.filter(s => s.id !== search.id))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdvancedMessageSearch;
