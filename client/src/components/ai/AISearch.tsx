
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Search, Sparkles, Loader2 } from 'lucide-react';
import { useEnhancedAI } from '@/hooks/useEnhancedAI';

const AISearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchContext, setSearchContext] = useState('');
  const { searchWithAI, generatedText, isGenerating } = useEnhancedAI();

  const handleSearch = async () => {
    await searchWithAI(searchQuery, searchContext);
  };

  const quickSearches = [
    'Golden Retriever puppies under $1000',
    'Small hypoallergenic dogs for apartments',
    'Family-friendly dogs good with children',
    'Active dogs for running companions',
    'Low-maintenance dogs for seniors'
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles size={20} />
          AI-Powered Pet Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">What kind of pet are you looking for?</label>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g., Golden Retriever, small dog, hypoallergenic..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tell us more about your preferences</label>
          <Textarea
            value={searchContext}
            onChange={(e) => setSearchContext(e.target.value)}
            placeholder="Describe your lifestyle, living situation, experience level, budget, or any specific requirements..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Quick Searches</label>
          <div className="flex flex-wrap gap-2">
            {quickSearches.map((query, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery(query)}
                className="text-xs"
              >
                {query}
              </Button>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleSearch} 
          disabled={!searchQuery.trim() || isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Find Perfect Pets with AI
            </>
          )}
        </Button>

        {generatedText && (
          <div className="space-y-2">
            <label className="text-sm font-medium">AI Search Results & Recommendations</label>
            <Textarea
              value={generatedText}
              readOnly
              rows={10}
              className="resize-none bg-gray-50"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AISearch;
