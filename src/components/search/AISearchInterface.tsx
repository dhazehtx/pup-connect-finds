import React, { useState, useEffect } from 'react';
import { Search, Filter, BookmarkPlus, TrendingUp, MapPin, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAISearch } from '@/hooks/useAISearch';
import { useSmartRecommendations } from '@/hooks/useSmartRecommendations';
import SearchFiltersPanel from './SearchFiltersPanel';
import SearchResultsDisplay from './SearchResultsDisplay';
import SavedSearchesPanel from './SavedSearchesPanel';
import SaveSearchDialog from './SaveSearchDialog';
import { useToast } from '@/hooks/use-toast';

const AISearchInterface = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'recommendations' | 'trending'>('search');
  const [searchFilters, setSearchFilters] = useState({
    breeds: [],
    priceRange: [0, 5000] as [number, number],
    ageRange: [0, 156] as [number, number],
    location: '',
    radius: 50,
    verifiedOnly: false,
    availableOnly: true,
    sortBy: 'relevance' as 'relevance' | 'price' | 'age' | 'distance' | 'newest'
  });

  const { toast } = useToast();
  
  const {
    searchResults,
    savedSearches,
    searchSuggestions,
    loading: searchLoading,
    performAISearch,
    getSearchSuggestions,
    saveSearch,
    loadSavedSearches,
    deleteSavedSearch
  } = useAISearch();

  const {
    recommendations,
    trendingListings,
    loading: recommendationsLoading,
    trackUserInteraction
  } = useSmartRecommendations();

  useEffect(() => {
    loadSavedSearches();
  }, [loadSavedSearches]);

  useEffect(() => {
    getSearchSuggestions(searchQuery);
  }, [searchQuery, getSearchSuggestions]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const filters = {
      query: searchQuery,
      ...searchFilters
    };

    await performAISearch(filters);
    setActiveTab('search');
  };

  const handleSaveSearch = async (name: string, notifyOnNewMatches: boolean) => {
    const filters = {
      query: searchQuery,
      ...searchFilters
    };

    const result = await saveSearch(name, filters, notifyOnNewMatches);
    if (result) {
      setShowSaveDialog(false);
      toast({
        title: "Search Saved",
        description: "Your search has been saved successfully",
      });
    }
  };

  const handleLoadSavedSearch = (search: any) => {
    setSearchQuery(search.filters.query || '');
    setSearchFilters({
      breeds: search.filters.breeds || [],
      priceRange: search.filters.priceRange || [0, 5000],
      ageRange: search.filters.ageRange || [0, 156],
      location: search.filters.location || '',
      radius: search.filters.radius || 50,
      verifiedOnly: search.filters.verifiedOnly || false,
      availableOnly: search.filters.availableOnly || true,
      sortBy: (search.filters.sortBy || 'relevance') as 'relevance' | 'price' | 'age' | 'distance' | 'newest'
    });
    handleSearch();
  };

  const handleInteraction = (type: string, listingId: string) => {
    trackUserInteraction(type, listingId);
    
    if (type === 'view') {
      // Navigate to listing details
      console.log('View listing:', listingId);
    } else if (type === 'favorite') {
      toast({
        title: "Added to Favorites",
        description: "This listing has been saved to your favorites",
      });
    }
  };

  const getCurrentFiltersCount = () => {
    let count = 0;
    if (searchFilters.breeds.length > 0) count++;
    if (searchFilters.location) count++;
    if (searchFilters.verifiedOnly) count++;
    if (searchFilters.priceRange[0] > 0 || searchFilters.priceRange[1] < 5000) count++;
    return count;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          {/* Search Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI-Powered Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Describe your perfect dog companion..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>

              {/* Search Suggestions */}
              {searchSuggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {searchSuggestions.map((suggestion, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setSearchQuery(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={handleSearch} disabled={!searchQuery.trim()} className="flex-1">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative"
                >
                  <Filter className="h-4 w-4" />
                  {getCurrentFiltersCount() > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                      {getCurrentFiltersCount()}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(true)}
                  disabled={!searchQuery.trim()}
                >
                  <BookmarkPlus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Filters */}
          {showFilters && (
            <SearchFiltersPanel
              filters={searchFilters}
              onFiltersChange={(newFilters) => setSearchFilters({ ...searchFilters, ...newFilters })}
              onClose={() => setShowFilters(false)}
            />
          )}

          {/* Saved Searches */}
          <SavedSearchesPanel
            savedSearches={savedSearches}
            onLoadSearch={handleLoadSavedSearch}
            onDeleteSearch={deleteSavedSearch}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Results
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                For You
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trending
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="mt-6">
              <SearchResultsDisplay
                activeTab="search"
                searchResults={searchResults}
                recommendations={[]}
                trendingListings={[]}
                loading={searchLoading}
                onInteraction={handleInteraction}
              />
            </TabsContent>

            <TabsContent value="recommendations" className="mt-6">
              <SearchResultsDisplay
                activeTab="recommendations"
                searchResults={[]}
                recommendations={recommendations}
                trendingListings={[]}
                loading={recommendationsLoading}
                onInteraction={handleInteraction}
              />
            </TabsContent>

            <TabsContent value="trending" className="mt-6">
              <SearchResultsDisplay
                activeTab="trending"
                searchResults={[]}
                recommendations={[]}
                trendingListings={trendingListings}
                loading={recommendationsLoading}
                onInteraction={handleInteraction}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Save Search Dialog */}
      <SaveSearchDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onSave={handleSaveSearch}
        currentQuery={searchQuery}
        currentFilters={searchFilters}
      />
    </div>
  );
};

export default AISearchInterface;
