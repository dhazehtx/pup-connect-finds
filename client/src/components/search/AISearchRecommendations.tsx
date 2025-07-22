
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, MapPin, Heart } from 'lucide-react';

interface AIRecommendation {
  id: string;
  type: 'breed' | 'location' | 'price' | 'seller';
  title: string;
  description: string;
  confidence: number;
  action?: () => void;
}

interface AISearchRecommendationsProps {
  searchQuery: string;
  userPreferences?: any;
  searchHistory?: any[];
  onApplyRecommendation: (recommendation: AIRecommendation) => void;
}

const AISearchRecommendations = ({ 
  searchQuery, 
  userPreferences, 
  searchHistory, 
  onApplyRecommendation 
}: AISearchRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const generateRecommendations = async () => {
    setLoading(true);
    
    // Mock AI-powered recommendations based on search context
    const mockRecommendations: AIRecommendation[] = [];
    
    if (searchQuery.toLowerCase().includes('family')) {
      mockRecommendations.push({
        id: '1',
        type: 'breed',
        title: 'Family-Friendly Breeds',
        description: 'Based on your search for family dogs, consider Golden Retrievers and Labradors',
        confidence: 0.92
      });
    }
    
    if (searchQuery.toLowerCase().includes('apartment')) {
      mockRecommendations.push({
        id: '2',
        type: 'breed',
        title: 'Apartment-Suitable Dogs',
        description: 'French Bulldogs and Boston Terriers are great for apartment living',
        confidence: 0.88
      });
    }
    
    // Location-based recommendations
    mockRecommendations.push({
      id: '3',
      type: 'location',
      title: 'Expand Search Radius',
      description: 'Increase your search radius to 75 miles to find 40% more matches',
      confidence: 0.85
    });
    
    // Price optimization
    mockRecommendations.push({
      id: '4',
      type: 'price',
      title: 'Price Range Optimization',
      description: 'Adjusting your budget by $200 could unlock 25% more options',
      confidence: 0.78
    });
    
    // Trending breeds
    mockRecommendations.push({
      id: '5',
      type: 'breed',
      title: 'Trending This Month',
      description: 'Bernese Mountain Dogs are popular in your area this month',
      confidence: 0.82
    });
    
    setRecommendations(mockRecommendations);
    setLoading(false);
  };

  useEffect(() => {
    if (searchQuery) {
      generateRecommendations();
    }
  }, [searchQuery]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'breed': return <Heart className="w-4 h-4" />;
      case 'location': return <MapPin className="w-4 h-4" />;
      case 'price': return <TrendingUp className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800';
    if (confidence >= 0.8) return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-sm text-gray-600">Generating AI recommendations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-blue-600" />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start space-x-3 flex-1">
              <div className="mt-1 text-blue-600">
                {getIcon(recommendation.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">{recommendation.title}</h4>
                <p className="text-xs text-gray-600 mb-2">{recommendation.description}</p>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getConfidenceColor(recommendation.confidence)}`}
                >
                  {Math.round(recommendation.confidence * 100)}% confidence
                </Badge>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onApplyRecommendation(recommendation)}
              className="ml-2"
            >
              Apply
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AISearchRecommendations;
