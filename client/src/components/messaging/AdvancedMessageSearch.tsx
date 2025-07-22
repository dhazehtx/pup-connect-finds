
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, X } from 'lucide-react';

interface AdvancedMessageSearchProps {
  messages: any[];
  onSearchResults: (results: any[]) => void;
  onClearSearch: () => void;
}

const AdvancedMessageSearch = ({ messages, onSearchResults, onClearSearch }: AdvancedMessageSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [messageTypes, setMessageTypes] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = () => {
    let filtered = messages;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by message types
    if (messageTypes.length > 0) {
      filtered = filtered.filter(msg => messageTypes.includes(msg.message_type));
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch (dateRange) {
        case 'today':
          cutoff.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(msg => 
        new Date(msg.created_at) >= cutoff
      );
    }

    setResults(filtered);
    onSearchResults(filtered);
  };

  const handleTypeToggle = (type: string) => {
    setMessageTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearAll = () => {
    setSearchQuery('');
    setDateRange('all');
    setMessageTypes([]);
    setResults([]);
    onClearSearch();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          Advanced Search
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search input */}
        <div>
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Date range filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Date Range</label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Past week</SelectItem>
              <SelectItem value="month">Past month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Message type filters */}
        <div>
          <label className="text-sm font-medium mb-2 block">Message Types</label>
          <div className="space-y-2">
            {['text', 'image', 'file', 'voice'].map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={messageTypes.includes(type)}
                  onCheckedChange={() => handleTypeToggle(type)}
                />
                <label htmlFor={type} className="text-sm capitalize">
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Search button */}
        <Button onClick={handleSearch} className="w-full">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>

        {/* Clear button */}
        {(searchQuery || dateRange !== 'all' || messageTypes.length > 0) && (
          <Button variant="outline" onClick={clearAll} className="w-full">
            <X className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        )}

        {/* Results summary */}
        {results.length > 0 && (
          <div className="mt-4">
            <Badge variant="secondary">
              {results.length} message{results.length !== 1 ? 's' : ''} found
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedMessageSearch;
