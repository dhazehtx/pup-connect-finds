
import React, { useState } from 'react';
import { Search, Sparkles, Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdvancedAISearch from '@/components/ai/AdvancedAISearch';
import SmartRecommendationEngine from '@/components/recommendations/SmartRecommendationEngine';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';

interface AISearchInterfaceProps {
  onResultsChange: (results: any[]) => void;
  className?: string;
}

const AISearchInterface = ({ onResultsChange, className }: AISearchInterfaceProps) => {
  const [activeTab, setActiveTab] = useState<'search' | 'recommendations'>('search');
  const [searchFilters, setSearchFilters] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const { trackUserInteraction } = useAIRecommendations();

  const handleSearchResults = (results: any[]) => {
    setSearchResults(results);
    onResultsChange(results);
    
    // Track search interaction for ML
    trackUserInteraction({
      type: 'search',
      metadata: { results_count: results.length, filters: searchFilters }
    });
  };

  const handleFiltersChange = (filters: any) => {
    setSearchFilters(filters);
    
    // Track filter usage for ML
    trackUserInteraction({
      type: 'filter',
      metadata: { filters }
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
        <Button
          variant={activeTab === 'search' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('search')}
          className="flex-1"
        >
          <Search className="h-4 w-4 mr-2" />
          AI Search
        </Button>
        <Button
          variant={activeTab === 'recommendations' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('recommendations')}
          className="flex-1"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Smart Recommendations
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'search' ? (
        <AdvancedAISearch
          onSearchResults={handleSearchResults}
          onFiltersChange={handleFiltersChange}
        />
      ) : (
        <SmartRecommendationEngine
          userPreferences={searchFilters}
          searchHistory={[]}
          favoriteBreeds={[]}
        />
      )}

      {/* Search Results Summary */}
      {searchResults.length > 0 && activeTab === 'search' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {searchResults.length} AI-matched results
                </Badge>
                {Object.keys(searchFilters).length > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <SlidersHorizontal className="h-3 w-3" />
                    {Object.keys(searchFilters).length} filters applied
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Refine Search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AISearchInterface;
