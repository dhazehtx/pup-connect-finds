
import React from 'react';
import { Search, Filter, Heart, MapPin, PlusCircle } from 'lucide-react';
import RippleButton from '@/components/ui/ripple-button';

interface EmptyStateProps {
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const EmptyState = ({ onClearFilters, hasActiveFilters }: EmptyStateProps) => {
  const suggestions = [
    { icon: MapPin, text: 'Try expanding your search radius' },
    { icon: PlusCircle, text: 'Browse different breeds' },
    { icon: Heart, text: 'Check rescue organizations' },
  ];

  return (
    <div className="text-center py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-soft-sky rounded-full mb-4 animate-pulse">
            <Search size={32} className="text-royal-blue" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {hasActiveFilters ? 'No puppies match your criteria' : 'No puppies found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {hasActiveFilters 
              ? 'Don\'t worry! Try adjusting your search to find your perfect pup.'
              : 'It looks like there are no puppies available right now, but new listings are added daily!'
            }
          </p>
        </div>

        {hasActiveFilters ? (
          <div className="space-y-4">
            <RippleButton 
              onClick={onClearFilters}
              className="bg-royal-blue text-white hover:bg-blue-600"
            >
              <Filter size={16} className="mr-2" />
              Clear All Filters
            </RippleButton>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-3">Try these suggestions:</p>
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  <suggestion.icon size={16} className="text-royal-blue" />
                  <span>{suggestion.text}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-soft-sky to-mint-green/20 rounded-lg p-6 text-sm">
            <Heart size={20} className="inline mr-2 text-royal-blue" />
            <p className="font-medium text-gray-700 mb-2">New puppies arrive daily!</p>
            <p className="text-gray-600">
              Set up search alerts to be notified when puppies matching your preferences become available.
            </p>
            <RippleButton
              onClick={() => {/* TODO: Implement search alerts */}}
              variant="outline"
              size="sm"
              className="mt-3 border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white"
            >
              Create Search Alert
            </RippleButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
