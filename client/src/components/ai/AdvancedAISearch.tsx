
import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Filter, MapPin, Heart, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

interface AISearchResult {
  id: string;
  type: 'breed' | 'temperament' | 'size' | 'location' | 'activity';
  suggestion: string;
  confidence: number;
  reasoning: string;
}

interface AdvancedAISearchProps {
  onSearchResults: (results: any[]) => void;
  onFiltersChange: (filters: any) => void;
  className?: string;
}

const AdvancedAISearch = ({ onSearchResults, onFiltersChange, className }: AdvancedAISearchProps) => {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISearchResult[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const { toast } = useToast();
  const debouncedQuery = useDebounce(query, 300);

  // Mock AI analysis - in production this would call your AI service
  const analyzeQuery = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setAiSuggestions([]);
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock AI suggestions based on query analysis
    const suggestions: AISearchResult[] = [];
    
    if (searchQuery.toLowerCase().includes('family')) {
      suggestions.push({
        id: '1',
        type: 'temperament',
        suggestion: 'Family-friendly dogs',
        confidence: 0.95,
        reasoning: 'Detected family context - suggesting gentle, patient breeds'
      });
    }
    
    if (searchQuery.toLowerCase().includes('apartment') || searchQuery.toLowerCase().includes('small space')) {
      suggestions.push({
        id: '2',
        type: 'size',
        suggestion: 'Small to medium breeds',
        confidence: 0.88,
        reasoning: 'Living space constraint detected'
      });
    }
    
    if (searchQuery.toLowerCase().includes('active') || searchQuery.toLowerCase().includes('exercise')) {
      suggestions.push({
        id: '3',
        type: 'activity',
        suggestion: 'High-energy breeds',
        confidence: 0.92,
        reasoning: 'Activity level preference identified'
      });
    }
    
    if (searchQuery.toLowerCase().includes('first time') || searchQuery.toLowerCase().includes('beginner')) {
      suggestions.push({
        id: '4',
        type: 'temperament',
        suggestion: 'Easy to train breeds',
        confidence: 0.90,
        reasoning: 'First-time owner detected - suggesting trainable dogs'
      });
    }

    // Add location-based suggestion if query contains location terms
    if (searchQuery.toLowerCase().includes('near') || searchQuery.toLowerCase().includes('local')) {
      suggestions.push({
        id: '5',
        type: 'location',
        suggestion: 'Nearby listings',
        confidence: 0.85,
        reasoning: 'Location preference detected'
      });
    }

    setAiSuggestions(suggestions);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (debouncedQuery) {
      analyzeQuery(debouncedQuery);
    }
  }, [debouncedQuery]);

  const handleSuggestionToggle = (suggestionId: string) => {
    setSelectedSuggestions(prev => {
      const updated = prev.includes(suggestionId)
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId];
      
      // Update filters based on selected suggestions
      const filters = aiSuggestions
        .filter(s => updated.includes(s.id))
        .reduce((acc, suggestion) => {
          switch (suggestion.type) {
            case 'temperament':
              acc.temperament = suggestion.suggestion;
              break;
            case 'size':
              acc.size = suggestion.suggestion;
              break;
            case 'activity':
              acc.activity_level = suggestion.suggestion;
              break;
            case 'location':
              acc.location_based = true;
              break;
          }
          return acc;
        }, {} as any);
      
      onFiltersChange(filters);
      return updated;
    });
  };

  const handleSmartSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a search query to use AI search",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Mock advanced search results - in production this would call your AI API
      const mockResults = [
        {
          id: '1',
          dog_name: 'Buddy',
          breed: 'Golden Retriever',
          ai_match_score: 0.94,
          reasoning: 'Perfect family dog with gentle temperament'
        },
        {
          id: '2',
          dog_name: 'Luna',
          breed: 'French Bulldog',
          ai_match_score: 0.87,
          reasoning: 'Great for apartment living, low exercise needs'
        }
      ];

      onSearchResults(mockResults);
      
      toast({
        title: "AI Search Complete",
        description: `Found ${mockResults.length} personalized matches based on your query`,
      });
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to perform AI search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI-Powered Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Describe your ideal dog... (e.g., 'family-friendly dog for apartment living')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSmartSearch} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Smart Search
                </>
              )}
            </Button>
          </div>

          {aiSuggestions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700">AI Suggestions:</h4>
              <div className="space-y-2">
                {aiSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <button
                      onClick={() => handleSuggestionToggle(suggestion.id)}
                      className={`mt-1 w-4 h-4 rounded border-2 flex items-center justify-center ${
                        selectedSuggestions.includes(suggestion.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedSuggestions.includes(suggestion.id) && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{suggestion.suggestion}</span>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(suggestion.confidence * 100)}% confident
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{suggestion.reasoning}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAISearch;
