
import React from 'react';
import SimpleAISearch from '@/components/search/SimpleAISearch';

const Search = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Smart Dog Search</h1>
          <p className="text-gray-600">Find your perfect companion with AI-powered recommendations</p>
        </div>
        
        <SimpleAISearch />
      </div>
    </div>
  );
};

export default Search;
