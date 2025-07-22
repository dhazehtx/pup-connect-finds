
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
    <div className={`bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
          <Crown className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-700">{message}</p>
        </div>
        <Button 
          size="sm"
          onClick={() => createCheckout('Pro')}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white border-0"
        >
          <Star className="w-3 h-3 mr-1" />
          {ctaText}
        </Button>
      </div>
    </div>
  );
};

export default PremiumBanner;
