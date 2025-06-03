
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Search, Star, X, Bell, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SearchHistoryItem {
  id: string;
  query: string;
  filters: any;
  timestamp: string;
  resultCount: number;
  saved: boolean;
  notifications: boolean;
}

const SearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSearchHistory();
    loadRecentlyViewed();
  }, []);

  const loadSearchHistory = () => {
    // Load from localStorage or API
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  };

  const loadRecentlyViewed = () => {
    const saved = localStorage.getItem('recentlyViewed');
    if (saved) {
      setRecentlyViewed(JSON.parse(saved));
    }
  };

  const addToHistory = (query: string, filters: any, resultCount: number) => {
    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query,
      filters,
      timestamp: new Date().toISOString(),
      resultCount,
      saved: false,
      notifications: false
    };

    const updated = [newItem, ...searchHistory.slice(0, 19)]; // Keep last 20
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  const saveSearch = (id: string) => {
    const updated = searchHistory.map(item =>
      item.id === id ? { ...item, saved: true } : item
    );
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
    
    toast({
      title: "Search Saved",
      description: "You'll be notified when new matches are found",
    });
  };

  const toggleNotifications = (id: string) => {
    const updated = searchHistory.map(item =>
      item.id === id ? { ...item, notifications: !item.notifications } : item
    );
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  const removeFromHistory = (id: string) => {
    const updated = searchHistory.filter(item => item.id !== id);
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
    toast({
      title: "History Cleared",
      description: "All search history has been removed",
    });
  };

  const reapplySearch = (item: SearchHistoryItem) => {
    // This would trigger the parent search function
    toast({
      title: "Search Applied",
      description: `Searching for: ${item.query}`,
    });
  };

  const filteredHistory = searchHistory.filter(item =>
    item.query.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Search History</CardTitle>
          <Button variant="outline" size="sm" onClick={clearHistory}>
            Clear All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Search your history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {filteredHistory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{item.query || 'Browse All'}</span>
                        {item.saved && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.resultCount} results
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleNotifications(item.id)}
                      >
                        {item.notifications ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => saveSearch(item.id)}
                        disabled={item.saved}
                      >
                        <Star className={`h-4 w-4 ${item.saved ? 'text-yellow-500 fill-current' : ''}`} />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => reapplySearch(item)}
                      >
                        Search Again
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromHistory(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {filteredHistory.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No search history found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recently Viewed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentlyViewed.slice(0, 6).map((item, index) => (
              <div key={index} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image || '/placeholder.svg'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {recentlyViewed.length === 0 && (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recently viewed items</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchHistory;
