
import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const EmptyState = ({ onClearFilters, hasActiveFilters }: EmptyStateProps) => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#E5EEFF' }}>
        <Search className="w-10 h-10" style={{ color: '#2363FF' }} />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {hasActiveFilters ? 'No puppies match your filters' : 'No puppies available yet'}
      </h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        {hasActiveFilters 
          ? 'Try adjusting your search criteria to find more listings.'
          : 'Be the first to list a puppy and help connect families with their perfect companion!'
        }
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="border-2 text-gray-700 hover:bg-gray-50"
            style={{ borderColor: '#CBD5E1' }}
          >
            Clear Filters
          </Button>
        )}
        <Button
          onClick={() => navigate('/create-listing')}
          className="text-white font-medium"
          style={{ backgroundColor: '#2363FF' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          List a Puppy
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;
