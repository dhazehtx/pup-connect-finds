
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Star, Sparkles, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimilarDog {
  id: number;
  name: string;
  breed: string;
  price: string;
  location: string;
  distance: string;
  image: string;
  rating: number;
  similarity: number;
  reasons: string[];
}

interface SimilarDogsRecommendationsProps {
  currentDogId: number;
  currentBreed: string;
  onViewDog?: (id: number) => void;
  onFavorite?: (id: number) => void;
}

const SimilarDogsRecommendations: React.FC<SimilarDogsRecommendationsProps> = ({
  currentDogId,
  currentBreed,
  onViewDog,
  onFavorite
}) => {
  const [recommendations, setRecommendations] = useState<SimilarDog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    generateSimilarRecommendations();
  }, [currentDogId, currentBreed]);

  const generateSimilarRecommendations = async () => {
    setLoading(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockRecommendations: SimilarDog[] = [
      {
        id: 101,
        name: "Sunny",
        breed: currentBreed,
        price: "$1,800",
        location: "Portland, OR",
        distance: "1.2 miles",
        image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop",
        rating: 4.9,
        similarity: 95,
        reasons: ["Same breed", "Similar age", "Same size"]
      },
      {
        id: 102,
        name: "Buddy",
        breed: "Labrador Retriever",
        price: "$1,650",
        location: "Seattle, WA",
        distance: "2.8 miles",
        image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop",
        rating: 4.8,
        similarity: 88,
        reasons: ["Similar temperament", "Great with kids", "Easy training"]
      },
      {
        id: 103,
        name: "Luna",
        breed: "Golden Doodle",
        price: "$2,200",
        location: "Vancouver, WA",
        distance: "3.5 miles",
        image: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop",
        rating: 4.7,
        similarity: 82,
        reasons: ["Similar grooming needs", "Friendly nature", "Medium size"]
      }
    ];
    
    setRecommendations(mockRecommendations);
    setLoading(false);
  };

  const handleViewSimilar = (dog: SimilarDog) => {
    onViewDog?.(dog.id);
    toast({
      title: "Opening similar dog",
      description: `Viewing ${dog.name} - ${dog.breed}`,
    });
  };

  const handleFavoriteSimilar = (dog: SimilarDog) => {
    onFavorite?.(dog.id);
    toast({
      title: "Added to favorites",
      description: `${dog.name} has been saved to your favorites`,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Finding Similar Dogs...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">AI is analyzing similar dogs for you</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Dogs Similar to This One
        </CardTitle>
        <p className="text-sm text-gray-600">
          AI-powered recommendations based on breed, temperament, and characteristics
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {recommendations.map((dog) => (
            <div key={dog.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <img
                  src={dog.image}
                  alt={dog.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-lg">{dog.name}</h4>
                      <p className="text-gray-600">{dog.breed}</p>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      {dog.similarity}% match
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-2 text-sm text-gray-600">
                    <span className="font-semibold text-green-600">{dog.price}</span>
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      {dog.distance}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-500" />
                      {dog.rating}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs text-purple-600 font-medium mb-1">Why similar:</p>
                    <div className="flex flex-wrap gap-1">
                      {dog.reasons.map((reason, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleViewSimilar(dog)}
                      className="flex-1"
                    >
                      <Eye size={14} className="mr-1" />
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFavoriteSimilar(dog)}
                    >
                      <Heart size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Button variant="outline" className="w-full mt-4">
          <Sparkles size={16} className="mr-2" />
          Find More Similar Dogs
        </Button>
      </CardContent>
    </Card>
  );
};

export default SimilarDogsRecommendations;
