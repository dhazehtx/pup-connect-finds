
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AISearchInterface from '@/components/search/AISearchInterface';
import ListingCard from '@/components/ListingCard';

const AISearch = () => {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState([]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI-Powered Search</h1>
            <p className="text-gray-600 mt-1">Find your perfect companion with intelligent matching</p>
          </div>
        </div>

        {/* AI Search Interface */}
        <AISearchInterface onResultsChange={setSearchResults} />

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Search Results</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((result: any) => (
                <ListingCard key={result.id} listing={result} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISearch;
