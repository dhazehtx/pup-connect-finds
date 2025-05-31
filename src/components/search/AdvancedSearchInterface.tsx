
import React, { useState, useEffect } from 'react';
import { Search, Filter, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchFilters {
  query?: string;
  breed?: string;
  minPrice?: number;
  maxPrice?: number;
  minAge?: number;
  maxAge?: number;
  location?: string;
  userType?: 'breeder' | 'shelter';
  verified?: boolean;
}

const AdvancedSearchInterface = () => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  const {
    searchResults,
    savedSearches,
    suggestions,
    loading,
    performSearch,
    getSearchSuggestions,
    saveSearch,
    deleteSavedSearch
  } = useAdvancedSearch();

  const debouncedQuery = useDebounce(filters.query || '', 300);

  // Get suggestions when query changes
  useEffect(() => {
    if (debouncedQuery) {
      getSearchSuggestions(debouncedQuery);
    }
  }, [debouncedQuery, getSearchSuggestions]);

  // Perform search when filters change
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      performSearch(filters);
    }
  }, [filters, performSearch]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleSaveSearch = async () => {
    if (saveSearchName.trim()) {
      await saveSearch(saveSearchName, filters, true);
      setSaveSearchName('');
      setShowSaveDialog(false);
    }
  };

  const loadSavedSearch = (search: any) => {
    setFilters(search.filters);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search for dogs, breeds, or locations..."
              value={filters.query || ''}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="pl-10"
            />
            
            {/* Search Suggestions */}
            {suggestions.length > 0 && filters.query && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleFilterChange('query', suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} className="mr-2" />
            Filters
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowSaveDialog(true)}
            disabled={Object.keys(filters).length === 0}
          >
            <Save size={16} className="mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Advanced Filters
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Breed */}
              <div>
                <Label>Breed</Label>
                <Input
                  placeholder="e.g., Golden Retriever"
                  value={filters.breed || ''}
                  onChange={(e) => handleFilterChange('breed', e.target.value)}
                />
              </div>

              {/* Location */}
              <div>
                <Label>Location</Label>
                <Input
                  placeholder="City, State"
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>

              {/* User Type */}
              <div>
                <Label>Seller Type</Label>
                <Select value={filters.userType} onValueChange={(value) => handleFilterChange('userType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breeder">Breeder</SelectItem>
                    <SelectItem value="shelter">Shelter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <Label>Price Range: ${filters.minPrice || 0} - ${filters.maxPrice || 10000}</Label>
              <div className="flex gap-4 mt-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value) || undefined)}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value) || undefined)}
                  />
                </div>
              </div>
            </div>

            {/* Age Range */}
            <div>
              <Label>Age Range: {filters.minAge || 0} - {filters.maxAge || 120} months</Label>
              <div className="flex gap-4 mt-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Min Age (months)"
                    value={filters.minAge || ''}
                    onChange={(e) => handleFilterChange('minAge', parseInt(e.target.value) || undefined)}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Max Age (months)"
                    value={filters.maxAge || ''}
                    onChange={(e) => handleFilterChange('maxAge', parseInt(e.target.value) || undefined)}
                  />
                </div>
              </div>
            </div>

            {/* Verified Only */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={filters.verified || false}
                onCheckedChange={(checked) => handleFilterChange('verified', checked)}
              />
              <Label>Show only verified sellers</Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {savedSearches.map((search) => (
                <Badge
                  key={search.id}
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-200 pr-1"
                >
                  <span onClick={() => loadSavedSearch(search)}>{search.name}</span>
                  <button
                    onClick={() => deleteSavedSearch(search.id)}
                    className="ml-2 hover:text-red-600"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <Card>
          <CardHeader>
            <CardTitle>Save Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter search name..."
              value={saveSearchName}
              onChange={(e) => setSaveSearchName(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveSearch} disabled={!saveSearchName.trim()}>
                Save Search
              </Button>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {loading ? 'Searching...' : `${searchResults.length} results found`}
        </p>
      </div>

      {/* Search Results Grid would go here */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchResults.map((result) => (
          <Card key={result.id} className="overflow-hidden">
            <div className="aspect-square">
              <img
                src={result.image_url || '/placeholder.svg'}
                alt={result.dog_name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold">{result.dog_name}</h3>
              <p className="text-sm text-gray-600">{result.breed}</p>
              <p className="text-sm text-gray-600">{result.age} months old</p>
              <p className="font-bold text-lg">${result.price.toLocaleString()}</p>
              {result.profiles?.verified && (
                <Badge variant="secondary" className="mt-2">
                  Verified Seller
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdvancedSearchInterface;
