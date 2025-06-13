
import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Filter, Save, TrendingUp, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAISearch } from '@/hooks/useAISearch';
import { useSmartRecommendations } from '@/hooks/useSmartRecommendations';
import { useDebounce } from '@/hooks/useDebounce';
import SearchFiltersPanel from './SearchFiltersPanel';
import SearchResultsDisplay from './SearchResultsDisplay';
import SavedSearchesPanel from './SavedSearchesPanel';
import SaveSearchDialog from './SaveSearchDialog';

const AISearchInterface = () => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'recommendations' | 'trending'>('search');
  
  const {
    searchResults,
    savedSearches,
    searchSuggestions,
    loading,
    totalResults,
    performAISearch,
    getSearchSuggestions,
    saveSearch,
    loadSavedSearches
  } = useAISearch();
  
  const {
    recommendations,
    trendingListings,
    trackUserInteraction
  } = useSmartRecommendations();

  const [filters, setFilters] = useState({
    query: '',
    breeds: [],
    priceRange: [0, 5000] as [number, number],
    ageRange: [0, 156] as [number, number],
    location: '',
    radius: 50,
    verifiedOnly: false,
    availableOnly: true,
    sortBy: 'relevance' as const
  });

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      getSearchSuggestions(debouncedQuery);
    }
  }, [debouncedQuery, getSearchSuggestions]);

  useEffect(() => {
    loadSavedSearches();
  }, [loadSavedSearches]);

  const handleSearch = async () => {
    const searchFilters = { ...filters, query };
    await performAISearch(searchFilters);
    
    // Track search interaction
    trackUserInteraction('search', '', { query, filters: searchFilters });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSaveSearch = async (name: string, notifyOnNewMatches: boolean) => {
    const searchFilters = { ...filters, query };
    await saveSearch(name, searchFilters, notifyOnNewMatches);
    setShowSaveDialog(false);
  };

  const handleResultInteraction = (type: string, listingId: string) => {
    trackUserInteraction(type, listingId);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI-Powered Dog Discovery
          </h1>
          <p className="text-muted-foreground text-lg">
            Find your perfect companion with intelligent search and personalized recommendations
          </p>
        </div>

        {/* Search Interface */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <CardTitle>Smart Search</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Advanced Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(true)}
                  disabled={!query && Object.keys(filters).length === 0}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Search
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Try: 'Golden Retriever puppies under $2000 near San Francisco' or 'Family-friendly dogs good with kids'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 pr-20 h-12 text-lg"
              />
              <Button
                onClick={handleSearch}
                disabled={loading || !query}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                size="sm"
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Search Suggestions */}
            {searchSuggestions.length > 0 && query && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Suggestions:</span>
                {searchSuggestions.slice(0, 5).map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => setQuery(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            )}

            {/* Active Filters Display */}
            {(filters.breeds?.length > 0 || filters.location || filters.verifiedOnly) && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {filters.breeds?.map(breed => (
                  <Badge key={breed} variant="outline">{breed}</Badge>
                ))}
                {filters.location && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {filters.location}
                  </Badge>
                )}
                {filters.verifiedOnly && (
                  <Badge variant="outline">Verified Only</Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <SearchFiltersPanel
            filters={filters}
            onFiltersChange={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
          <Button
            variant={activeTab === 'search' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('search')}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Search Results
            {totalResults > 0 && (
              <Badge variant="secondary" className="ml-1">
                {totalResults}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeTab === 'recommendations' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('recommendations')}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            For You
            {recommendations.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {recommendations.length}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeTab === 'trending' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('trending')}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Trending
            {trendingListings.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {trendingListings.length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Content Area */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <SearchResultsDisplay
              activeTab={activeTab}
              searchResults={searchResults}
              recommendations={recommendations}
              trendingListings={trendingListings}
              loading={loading}
              onInteraction={handleResultInteraction}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SavedSearchesPanel
              savedSearches={savedSearches}
              onLoadSearch={(search) => {
                setFilters(search.filters);
                setQuery(search.filters.query);
                performAISearch(search.filters);
              }}
            />
          </div>
        </div>

        {/* Save Search Dialog */}
        <SaveSearchDialog
          open={showSaveDialog}
          onOpenChange={setShowSaveDialog}
          onSave={handleSaveSearch}
          currentQuery={query}
          currentFilters={filters}
        />
      </div>
    </div>
  );
};

export default AISearchInterface;
