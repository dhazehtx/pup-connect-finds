
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Search, Sparkles, Heart, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceSearchInterfaceProps {
  onSearchResults?: (query: string, filters: any) => void;
  onBreedRecommendation?: (breeds: string[]) => void;
}

interface BreedRecommendation {
  breed: string;
  match: number;
  reasons: string[];
  characteristics: string[];
}

const VoiceSearchInterface: React.FC<VoiceSearchInterfaceProps> = ({
  onSearchResults,
  onBreedRecommendation
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recommendations, setRecommendations] = useState<BreedRecommendation[]>([]);
  const [showLifestyleQuiz, setShowLifestyleQuiz] = useState(false);
  const { toast } = useToast();

  // Simulate voice recognition
  const startListening = () => {
    setIsListening(true);
    setTranscript('');
    
    // Simulate voice input after 2 seconds
    setTimeout(() => {
      const sampleQueries = [
        "I'm looking for a friendly dog good with kids",
        "Show me small dogs that don't shed much",
        "Find golden retrievers under $2000 near me",
        "I want an active dog for running and hiking",
        "Looking for a calm apartment-friendly dog"
      ];
      
      const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
      setTranscript(randomQuery);
      setIsListening(false);
      processVoiceInput(randomQuery);
    }, 2000);
  };

  const stopListening = () => {
    setIsListening(false);
    if (transcript) {
      processVoiceInput(transcript);
    }
  };

  const processVoiceInput = async (input: string) => {
    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Parse voice input for search intent
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('recommend') || lowerInput.includes('suggest') || lowerInput.includes('good with')) {
      generateBreedRecommendations(input);
    } else {
      performVoiceSearch(input);
    }
    
    setIsProcessing(false);
  };

  const generateBreedRecommendations = (input: string) => {
    const mockRecommendations: BreedRecommendation[] = [
      {
        breed: "Golden Retriever",
        match: 95,
        reasons: ["Excellent with children", "Friendly temperament", "Easy to train"],
        characteristics: ["Medium-Large", "High energy", "Moderate grooming"]
      },
      {
        breed: "Labrador Retriever",
        match: 92,
        reasons: ["Great family dog", "Loyal and gentle", "Good with kids"],
        characteristics: ["Large", "High energy", "Low grooming"]
      },
      {
        breed: "Cavalier King Charles Spaniel",
        match: 88,
        reasons: ["Gentle nature", "Good apartment size", "Loves children"],
        characteristics: ["Small", "Moderate energy", "Regular grooming"]
      }
    ];
    
    setRecommendations(mockRecommendations);
    onBreedRecommendation?.(mockRecommendations.map(r => r.breed));
    
    toast({
      title: "AI Recommendations Ready!",
      description: `Found ${mockRecommendations.length} perfect breed matches for you`,
    });
  };

  const performVoiceSearch = (query: string) => {
    // Extract search parameters from voice input
    const filters: any = {};
    
    if (query.toLowerCase().includes('small')) filters.size = 'small';
    if (query.toLowerCase().includes('large')) filters.size = 'large';
    if (query.toLowerCase().includes('golden retriever')) filters.breed = 'Golden Retriever';
    if (query.toLowerCase().includes('under $2000')) filters.maxPrice = 2000;
    if (query.toLowerCase().includes('near me')) filters.location = 'nearby';
    
    onSearchResults?.(query, filters);
    
    toast({
      title: "Voice search completed",
      description: `Searching for: "${query}"`,
    });
  };

  const startLifestyleQuiz = () => {
    setShowLifestyleQuiz(true);
    toast({
      title: "Lifestyle Quiz Started",
      description: "Answer a few questions to get personalized breed recommendations",
    });
  };

  return (
    <div className="space-y-6">
      {/* Voice Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Button
              onClick={isListening ? stopListening : startListening}
              size="lg"
              className={`w-32 h-32 rounded-full ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isListening ? (
                <MicOff size={32} />
              ) : (
                <Mic size={32} />
              )}
            </Button>
            
            <p className="mt-4 text-sm text-gray-600">
              {isListening 
                ? "Listening... speak your search" 
                : "Tap to search by voice"
              }
            </p>
          </div>

          {transcript && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">You said:</p>
              <p className="text-gray-700">"{transcript}"</p>
            </div>
          )}

          {isProcessing && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Processing your request...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Breed Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Breed Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={startLifestyleQuiz}
            variant="outline" 
            className="w-full"
          >
            Take Lifestyle Quiz for Personalized Recommendations
          </Button>

          {recommendations.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Recommended for you:</h4>
              {recommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{rec.breed}</h5>
                    <Badge variant="secondary">{rec.match}% match</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-green-600">Why this breed:</p>
                      <ul className="text-sm text-gray-600">
                        {rec.reasons.map((reason, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <Heart size={12} className="text-green-500" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Characteristics:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rec.characteristics.map((char, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {char}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => onSearchResults?.(rec.breed, { breed: rec.breed })}
                  >
                    <Search size={14} className="mr-1" />
                    Find {rec.breed}s
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lifestyle Quiz Modal (simplified) */}
      {showLifestyleQuiz && (
        <Card>
          <CardHeader>
            <CardTitle>Lifestyle Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <Sparkles size={48} className="text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Lifestyle Assessment</h3>
              <p className="text-gray-600 mb-4">
                Interactive quiz coming soon! Answer questions about your living situation, 
                activity level, and preferences to get perfect breed matches.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Living Space</h4>
                  <p className="text-sm text-gray-600">Apartment, house, yard size</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Activity Level</h4>
                  <p className="text-sm text-gray-600">Exercise preferences</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Experience</h4>
                  <p className="text-sm text-gray-600">First-time vs experienced</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Preferences</h4>
                  <p className="text-sm text-gray-600">Size, grooming, temperament</p>
                </div>
              </div>
              <Button 
                className="mt-4"
                onClick={() => {
                  setShowLifestyleQuiz(false);
                  generateBreedRecommendations("lifestyle quiz completed");
                }}
              >
                Get Sample Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VoiceSearchInterface;
