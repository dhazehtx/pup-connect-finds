
import React from 'react';
import { useFreemiumLimits } from '@/hooks/useFreemiumLimits';
import PremiumUpgradePrompt from '@/components/monetization/PremiumUpgradePrompt';
import PremiumBanner from '@/components/monetization/PremiumBanner';
import AdBanner from '@/components/advertising/AdBanner';
import Explore from '@/pages/Explore';

const ExploreWithFreemium = () => {
  const { limits, isPremium } = useFreemiumLimits();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Ad */}
      <div className="container mx-auto px-4 py-6">
        <AdBanner targetPage="explore" format="banner" />
      </div>

      {/* Premium Banner for Free Users */}
      {!isPremium && limits.filtersUsed >= 1 && (
        <div className="container mx-auto px-4 mb-6">
          <PremiumBanner 
            message="Want alerts on new litters? Upgrade to Premium for unlimited filters and early access!" 
            className="max-w-4xl mx-auto"
          />
        </div>
      )}

      {/* Main Explore Content */}
      <Explore />

      {/* Sponsored Listing Ad */}
      <div className="container mx-auto px-4 mb-6">
        <AdBanner targetPage="explore" format="sponsored" className="max-w-4xl mx-auto" />
      </div>
    </div>
  );
};

export default ExploreWithFreemium;
