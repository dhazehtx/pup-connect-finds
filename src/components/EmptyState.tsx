
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Heart, MapPin, PlusCircle } from 'lucide-react';
import RippleButton from '@/components/ui/ripple-button';
import EmptyStateComponent from '@/components/ui/empty-state';

interface EmptyStateProps {
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const EmptyState = ({ onClearFilters, hasActiveFilters }: EmptyStateProps) => {
  const { t } = useTranslation();

  const suggestions = [
    { 
      icon: <MapPin className="w-4 h-4 text-royal-blue" />, 
      text: 'Try expanding your search radius' 
    },
    { 
      icon: <PlusCircle className="w-4 h-4 text-royal-blue" />, 
      text: 'Browse different breeds' 
    },
    { 
      icon: <Heart className="w-4 h-4 text-royal-blue" />, 
      text: 'Check rescue organizations' 
    },
  ];

  if (hasActiveFilters) {
    return (
      <EmptyStateComponent
        icon={<Search className="w-8 h-8 text-royal-blue" />}
        title={t('listings.noResults')}
        description="Don't worry! Try adjusting your search to find your perfect pup."
        actionButton={{
          text: t('listings.clearFilters'),
          onClick: onClearFilters,
          variant: 'default'
        }}
        suggestions={suggestions}
      />
    );
  }

  return (
    <EmptyStateComponent
      icon={<Search className="w-8 h-8 text-royal-blue" />}
      title={t('listings.noResults')}
      description={t('listings.noResultsDescription')}
      actionButton={{
        text: 'Create Search Alert',
        onClick: () => {/* TODO: Implement search alerts */},
        variant: 'outline'
      }}
      suggestions={[
        {
          icon: <Heart className="w-4 h-4 text-royal-blue" />,
          text: 'New puppies arrive daily! Set up search alerts to be notified when puppies matching your preferences become available.'
        }
      ]}
    />
  );
};

export default EmptyState;
