
import React from 'react';
import { Search, Heart, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const EmptyState = ({ onClearFilters, hasActiveFilters }: EmptyStateProps) => {
  if (hasActiveFilters) {
    return (
      <div className="text-center py-12">
        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
        <p className="text-gray-600 mb-6">
          We couldn't find any listings matching your search criteria.
        </p>
        <Button onClick={onClearFilters} variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Listings Yet</h3>
      <p className="text-gray-600 mb-6">
        Be the first to discover amazing puppies! Check back soon for new listings.
      </p>
    </div>
  );
};

export default EmptyState;
