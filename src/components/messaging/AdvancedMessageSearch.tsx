
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
import { format, formatDistanceToNow } from 'date-fns';

interface AdvancedMessageSearchProps {
  messages: any[];
  onSearchResults: (results: any[]) => void;
  onClearSearch: () => void;
  onResultSelect?: (messageId: string) => void;
  conversationId?: string;
}

interface SearchFilters {
  query: string;
  messageType: string;
  messageTypes: string[];
  sender: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
    start: string;
    end: string;
  };
  hasAttachments: boolean;
  isStarred: boolean;
  tags: string[];
}

const AdvancedMessageSearch = ({ 
  messages, 
  onSearchResults, 
  onClearSearch,
  onResultSelect,
  conversationId 
}: AdvancedMessageSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    messageType: 'all',
    messageTypes: [],
    sender: 'all',
    dateRange: { from: null, to: null, start: '', end: '' },
    hasAttachments: false,
    isStarred: false,
    tags: []
  });
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localResults, setLocalResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

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

  // Local search function for instant results
  const performLocalSearch = useCallback((query: string, appliedFilters: typeof filters) => {
    if (!query.trim() && !Object.values(appliedFilters).some(f => Array.isArray(f) ? f.length > 0 : f !== '' && f !== 'all' && f !== false && f !== null)) {
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
      if (appliedFilters.messageType !== 'all' && appliedFilters.messageTypes.length > 0 && !appliedFilters.messageTypes.includes(message.message_type)) {
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
      if (appliedFilters.sender && appliedFilters.sender !== 'all' && message.sender_id !== appliedFilters.sender) {
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
  React.useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performLocalSearch(searchQuery, filters);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filters, performLocalSearch]);

  const handleClearSearch = () => {
    console.log('🔍 AdvancedMessageSearch - Clearing search');
    setSearchQuery('');
    setFilters({
      query: '',
      messageType: 'all',
      messageTypes: [],
      sender: 'all',
      dateRange: { from: null, to: null, start: '', end: '' },
      hasAttachments: false,
      isStarred: false,
      tags: []
    });
    setLocalResults([]);
    setShowResults(false);
    onClearSearch();
  };

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
      messageTypes: [],
      sender: 'all',
      dateRange: { from: null, to: null, start: '', end: '' },
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
    filters.sender !== 'all';

  return (
    <div className="p-3 border-b bg-background">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
        {hasActiveFilters && (
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="w-4 h-4" />
                Filters
                {(Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f !== '' && f !== 'all' && f !== false && f !== null)) && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                    {filters.messageTypes.length + (filters.dateRange.start ? 1 : 0) + (filters.dateRange.end ? 1 : 0) + (filters.sender !== 'all' ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Message Types</label>
                  <div className="flex flex-wrap gap-1">
                    {['text', 'image', 'voice', 'file'].map(type => (
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
                      query: '',
                      messageType: 'all',
                      messageTypes: [],
                      sender: 'all',
                      dateRange: { from: null, to: null, start: '', end: '' },
                      hasAttachments: false,
                      isStarred: false,
                      tags: []
                    });
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
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

      {/* Quick search results */}
      {showResults && localResults.length > 0 && onResultSelect && (
        <div className="mt-2 max-h-40 overflow-y-auto">
          {localResults.slice(0, 5).map((message) => (
            <div
              key={message.id}
              className="p-2 hover:bg-muted/50 cursor-pointer rounded text-sm border-b last:border-b-0"
              onClick={() => onResultSelect(message.id)}
            >
              <p className="truncate">{message.content}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedMessageSearch;
