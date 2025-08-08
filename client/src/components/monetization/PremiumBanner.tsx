
import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Star } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface PremiumBannerProps {
  message: string;
  ctaText?: string;
  className?: string;
}

const PremiumBanner = ({ message, ctaText = "Upgrade to Premium", className = "" }: PremiumBannerProps) => {
  const { createCheckout } = useSubscription();

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-primary-50 border border-primary-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full">
          <Crown className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-700">{message}</p>
        </div>
        <Button 
          size="sm"
          onClick={() => createCheckout('Pro')}
          className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white border-0"
        >
          <Star className="w-3 h-3 mr-1" />
          {ctaText}
        </Button>
      </div>
    </div>
  );
};

export default PremiumBanner;
