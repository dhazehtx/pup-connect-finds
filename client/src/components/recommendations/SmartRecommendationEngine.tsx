
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, MapPin, TrendingUp, Zap, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface RecommendationScore {
  overall: number;
  compatibility: number;
  location: number;
  price: number;
  preferences: number;
}

interface SmartRecommendation {
  id: string;
  dog_name: string;
  breed: string;
  age: number;
  price: number;
  location: string;
  image_url?: string;
  scores: RecommendationScore;
  reasoning: string[];
  match_type: 'perfect_match' | 'good_fit' | 'trending' | 'new_arrival';
  seller_rating: number;
  distance_km?: number;
}

interface SmartRecommendationEngineProps {
  userPreferences?: any;
  searchHistory?: any[];
  favoriteBreeds?: string[];
  className?: string;
}

const SmartRecommendationEngine = ({ 
  userPreferences, 
  searchHistory, 
  favoriteBreeds,
  className 
}: SmartRecommendationEngineProps) => {
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'perfect_match' | 'trending' | 'nearby'>('all');
  const { user } = useAuth();
  const { toast } = useToast();

  // Mock recommendation generation based on ML algorithms
  const generateRecommendations = async () => {
    setLoading(true);
    
    // Simulate ML processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockRecommendations: SmartRecommendation[] = [
      {
        id: '1',
        dog_name: 'Max',
        breed: 'Golden Retriever',
        age: 8,
        price: 1200,
        location: 'San Francisco, CA',
        image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
        scores: {
          overall: 0.94,
          compatibility: 0.96,
          location: 0.89,
          price: 0.91,
          preferences: 0.98
        },
        reasoning: [
          'Perfect match for family preference',
          'Breed aligns with your search history',
          'Within your budget range',
          'Highly rated seller'
        ],
        match_type: 'perfect_match',
        seller_rating: 4.9,
        distance_km: 12
      },
      {
        id: '2',
        dog_name: 'Luna',
        breed: 'French Bulldog',
        age: 6,
        price: 2500,
        location: 'Oakland, CA',
        image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop',
        scores: {
          overall: 0.87,
          compatibility: 0.85,
          location: 0.92,
          price: 0.78,
          preferences: 0.89
        },
        reasoning: [
          'Great for apartment living',
          'Low exercise requirements',
          'Excellent with children',
          'Recently reduced price'
        ],
        match_type: 'good_fit',
        seller_rating: 4.7,
        distance_km: 8
      },
      {
        id: '3',
        dog_name: 'Charlie',
        breed: 'Labrador',
        age: 10,
        price: 800,
        location: 'San Jose, CA',
        image_url: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop',
        scores: {
          overall: 0.91,
          compatibility: 0.93,
          location: 0.85,
          price: 0.95,
          preferences: 0.90
        },
        reasoning: [
          'Trending breed in your area',
          'Multiple similar searches',
          'Great value for money',
          'Verified seller'
        ],
        match_type: 'trending',
        seller_rating: 4.8,
        distance_km: 25
      }
    ];

    setRecommendations(mockRecommendations);
    setLoading(false);
  };

  useEffect(() => {
    generateRecommendations();
  }, [userPreferences, searchHistory]);

  const getMatchTypeIcon = (type: string) => {
    switch (type) {
      case 'perfect_match':
        return <Target className="h-4 w-4 text-green-600" />;
      case 'trending':
        return <TrendingUp className="h-4 w-4 text-orange-600" />;
      case 'good_fit':
        return <Zap className="h-4 w-4 text-blue-600" />;
      default:
        return <Star className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMatchTypeLabel = (type: string) => {
    switch (type) {
      case 'perfect_match':
        return 'Perfect Match';
      case 'trending':
        return 'Trending';
      case 'good_fit':
        return 'Good Fit';
      default:
        return 'Recommended';
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'perfect_match') return rec.match_type === 'perfect_match';
    if (selectedCategory === 'trending') return rec.match_type === 'trending';
    if (selectedCategory === 'nearby') return rec.distance_km && rec.distance_km <= 15;
    return true;
  });

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
            <span className="text-gray-600">Generating personalized recommendations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Smart Recommendations
          </CardTitle>
          <div className="flex gap-2 mt-4">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            <Button
              variant={selectedCategory === 'perfect_match' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('perfect_match')}
            >
              Perfect Matches
            </Button>
            <Button
              variant={selectedCategory === 'trending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('trending')}
            >
              Trending
            </Button>
            <Button
              variant={selectedCategory === 'nearby' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('nearby')}
            >
              Nearby
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecommendations.map((rec) => (
              <Card key={rec.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  {rec.image_url && (
                    <img
                      src={rec.image_url}
                      alt={rec.dog_name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge className="flex items-center gap-1 bg-white/90 text-gray-800">
                      {getMatchTypeIcon(rec.match_type)}
                      {getMatchTypeLabel(rec.match_type)}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-white/90 text-gray-800">
                      {Math.round(rec.scores.overall * 100)}% match
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{rec.dog_name}</h3>
                      <p className="text-gray-600">{rec.breed} • {rec.age} weeks old</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xl">${rec.price.toLocaleString()}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm">{rec.seller_rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {rec.location}
                      {rec.distance_km && (
                        <span className="ml-1">({rec.distance_km}km away)</span>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Why this match?</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {rec.reasoning.slice(0, 2).map((reason, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-green-600">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button className="flex-1" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartRecommendationEngine;
