
import React from 'react';
import { Search, Heart, PlusCircle } from 'lucide-react';
import RippleButton from '@/components/ui/ripple-button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionButton?: {
    text: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
  };
  suggestions?: Array<{
    icon: React.ReactNode;
    text: string;
    onClick?: () => void;
  }>;
  className?: string;
  variant?: 'default' | 'compact';
}

const EmptyState = ({
  icon,
  title,
  description,
  actionButton,
  suggestions,
  className,
  variant = 'default'
}: EmptyStateProps) => {
  const defaultIcon = <Search className="w-8 h-8 text-royal-blue" />;

  return (
    <div className={cn(
      'text-center',
      variant === 'compact' ? 'py-12' : 'py-16',
      className
    )}>
      <div className="max-w-md mx-auto">
        <div className={cn(
          'inline-flex items-center justify-center rounded-full mb-6',
          variant === 'compact' 
            ? 'w-16 h-16 bg-soft-sky' 
            : 'w-20 h-20 bg-gradient-to-br from-soft-sky to-mint-green/20'
        )}>
          {icon || defaultIcon}
        </div>

        <h3 className={cn(
          'font-semibold text-gray-900 mb-3',
          variant === 'compact' ? 'text-lg' : 'text-xl'
        )}>
          {title}
        </h3>

        <p className={cn(
          'text-gray-600 mb-6',
          variant === 'compact' ? 'text-sm' : 'text-base'
        )}>
          {description}
        </p>

        {actionButton && (
          <div className="mb-6">
            <RippleButton
              onClick={actionButton.onClick}
              variant={actionButton.variant}
              className={cn(
                actionButton.variant === 'outline' 
                  ? 'border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white'
                  : 'bg-royal-blue text-white hover:bg-blue-600'
              )}
            >
              {actionButton.text}
            </RippleButton>
          </div>
        )}

        {suggestions && suggestions.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Suggestions:</p>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3',
                  suggestion.onClick && 'cursor-pointer hover:bg-gray-100 transition-colors'
                )}
                onClick={suggestion.onClick}
              >
                {suggestion.icon}
                <span>{suggestion.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
