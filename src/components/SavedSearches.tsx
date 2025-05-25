
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Bookmark, X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FilterState {
  searchTerm: string;
  breed: string;
  minPrice: string;
  maxPrice: string;
  ageGroup: string;
  gender: string;
  sourceType: string;
  maxDistance: string;
  verifiedOnly: boolean;
  availableOnly: boolean;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: FilterState;
  createdAt: Date;
}

interface SavedSearchesProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const SavedSearches = ({ filters, onFiltersChange }: SavedSearchesProps) => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState('');

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'searchTerm') return value.length > 0;
    if (typeof value === 'boolean') return value;
    return value !== '' && value !== 'all';
  });

  const handleSaveSearch = () => {
    if (!searchName.trim() || !hasActiveFilters) return;

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName.trim(),
      filters: { ...filters },
      createdAt: new Date()
    };

    setSavedSearches(prev => [newSearch, ...prev]);
    setSearchName('');
    setShowSaveDialog(false);
  };

  const handleLoadSearch = (savedSearch: SavedSearch) => {
    onFiltersChange(savedSearch.filters);
  };

  const handleDeleteSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(search => search.id !== id));
  };

  const getSearchDescription = (searchFilters: FilterState) => {
    const parts = [];
    if (searchFilters.breed && searchFilters.breed !== 'all') parts.push(searchFilters.breed);
    if (searchFilters.sourceType && searchFilters.sourceType !== 'all') parts.push(searchFilters.sourceType);
    if (searchFilters.maxPrice) parts.push(`under $${searchFilters.maxPrice}`);
    return parts.slice(0, 3).join(', ') || 'Custom search';
  };

  if (savedSearches.length === 0 && !showSaveDialog) {
    return (
      <Card className="bg-white border border-gray-200 mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">No saved searches yet</span>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                className="text-royal-blue border-royal-blue hover:bg-soft-sky"
              >
                <Plus size={14} />
                Save Current Search
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200 mb-4">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark size={16} className="text-royal-blue" />
              <span className="text-sm font-medium text-gray-700">Saved Searches</span>
            </div>
            {hasActiveFilters && !showSaveDialog && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                className="text-royal-blue border-royal-blue hover:bg-soft-sky"
              >
                <Plus size={14} />
                Save Current
              </Button>
            )}
          </div>

          {showSaveDialog && (
            <div className="flex gap-2 p-3 bg-soft-sky rounded-lg">
              <Input
                placeholder="Name your search..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSaveSearch()}
              />
              <Button size="sm" onClick={handleSaveSearch} disabled={!searchName.trim()}>
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
            </div>
          )}

          {savedSearches.length > 0 && (
            <div className="space-y-2">
              {savedSearches.map((search) => (
                <div key={search.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleLoadSearch(search)}
                  >
                    <div className="font-medium text-sm text-gray-900">{search.name}</div>
                    <div className="text-xs text-gray-500">{getSearchDescription(search.filters)}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSearch(search.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedSearches;
