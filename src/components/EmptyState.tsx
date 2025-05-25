
import React from 'react';
import { Search, Filter, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const EmptyState = ({ onClearFilters, hasActiveFilters }: EmptyStateProps) => {
  return (
    <div className="text-center py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-soft-sky rounded-full mb-4">
            <Search size={32} className="text-royal-blue" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {hasActiveFilters ? 'No puppies match your criteria' : 'No puppies found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {hasActiveFilters 
              ? 'Try adjusting your filters to see more results'
              : 'It looks like there are no puppies available right now'
            }
          </p>
        </div>

        {hasActiveFilters && (
          <div className="space-y-3">
            <Button 
              onClick={onClearFilters}
              className="bg-royal-blue text-white hover:bg-blue-600"
            >
              <Filter size={16} className="mr-2" />
              Clear All Filters
            </Button>
            <div className="text-sm text-gray-500">
              or try searching for different breeds or locations
            </div>
          </div>
        )}

        {!hasActiveFilters && (
          <div className="bg-soft-sky rounded-lg p-4 text-sm text-gray-600">
            <Heart size={16} className="inline mr-1 text-royal-blue" />
            Check back soon for new puppy listings!
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
