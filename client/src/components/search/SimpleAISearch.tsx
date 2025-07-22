
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSmartRecommendations } from '@/hooks/useSmartRecommendations';
import { Search, Sparkles } from 'lucide-react';

const SimpleAISearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { recommendations, loading, generateRecommendations } = useSmartRecommendations();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    const filters = {
      breed: searchQuery.includes('breed:') ? searchQuery.replace('breed:', '').trim() : undefined,
      location: searchQuery.includes('location:') ? searchQuery.replace('location:', '').trim() : undefined,
    };

    await generateRecommendations(filters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          AI-Powered Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Search for dogs (e.g., 'Golden Retriever' or 'breed:Labrador')"
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="w-4 h-4" />
          </Button>
        </div>
        
        {recommendations.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Smart Recommendations ({recommendations.length})</h3>
            <div className="grid gap-2 max-h-40 overflow-y-auto">
              {recommendations.slice(0, 5).map((rec) => (
                <div key={rec.id} className="p-2 border rounded-lg">
                  <div className="font-medium">{rec.dog_name}</div>
                  <div className="text-sm text-gray-600">{rec.breed} • ${rec.price}</div>
                  <div className="text-xs text-blue-600">{rec.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleAISearch;
