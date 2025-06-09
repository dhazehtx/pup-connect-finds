
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  id: string;
  dog_name: string;
  breed: string;
  age: number;
  price: number;
  image_url?: string;
  profiles?: {
    verified: boolean;
  };
}

interface SearchResultsGridProps {
  results: SearchResult[];
  loading: boolean;
}

const SearchResultsGrid = ({ results, loading }: SearchResultsGridProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Searching...</p>
      </div>
    );
  }

  return (
    <>
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {results.length} results found
        </p>
      </div>

      {/* Search Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result) => (
          <Card key={result.id} className="overflow-hidden">
            <div className="aspect-square">
              <img
                src={result.image_url || '/placeholder.svg'}
                alt={result.dog_name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold">{result.dog_name}</h3>
              <p className="text-sm text-gray-600">{result.breed}</p>
              <p className="text-sm text-gray-600">{result.age} months old</p>
              <p className="font-bold text-lg">${result.price.toLocaleString()}</p>
              {result.profiles?.verified && (
                <Badge variant="secondary" className="mt-2">
                  Verified Seller
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default SearchResultsGrid;
