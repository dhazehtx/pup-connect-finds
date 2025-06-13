
import React from 'react';
import { Search, Bell, Trash2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface SavedSearch {
  id: string;
  name: string;
  filters: any;
  notify_on_new_matches: boolean;
  created_at: string;
  match_count: number;
}

interface SavedSearchesPanelProps {
  savedSearches: SavedSearch[];
  onLoadSearch: (search: SavedSearch) => void;
  onDeleteSearch?: (searchId: string) => void;
}

const SavedSearchesPanel = ({ 
  savedSearches, 
  onLoadSearch,
  onDeleteSearch 
}: SavedSearchesPanelProps) => {
  if (savedSearches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            Saved Searches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No saved searches yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Save your searches to get notified of new matches
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="h-5 w-5" />
          Saved Searches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {savedSearches.map((search) => (
          <div
            key={search.id}
            className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => onLoadSearch(search)}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-sm truncate flex-1">
                {search.name}
              </h4>
              {onDeleteSearch && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSearch(search.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 mb-2">
              {search.notify_on_new_matches && (
                <Badge variant="secondary" className="text-xs">
                  <Bell className="h-3 w-3 mr-1" />
                  Alerts On
                </Badge>
              )}
              {search.match_count > 0 && (
                <Badge variant="outline" className="text-xs">
                  {search.match_count} matches
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Saved {formatDistanceToNow(new Date(search.created_at), { addSuffix: true })}
            </div>

            {/* Preview of search criteria */}
            <div className="mt-2 text-xs text-muted-foreground">
              {search.filters.query && (
                <span>"{search.filters.query}"</span>
              )}
              {search.filters.breeds?.length > 0 && (
                <span className="ml-2">• {search.filters.breeds.join(', ')}</span>
              )}
              {search.filters.location && (
                <span className="ml-2">• {search.filters.location}</span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SavedSearchesPanel;
