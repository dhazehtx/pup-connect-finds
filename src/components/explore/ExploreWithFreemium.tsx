
import React, { useState, useEffect } from 'react';
import { useFreemiumLimits } from '@/hooks/useFreemiumLimits';
import PremiumUpgradePrompt from '@/components/monetization/PremiumUpgradePrompt';
import PremiumBanner from '@/components/monetization/PremiumBanner';
import AdBanner from '@/components/advertising/AdBanner';
import ExploreContainer from '@/components/explore/ExploreContainer';
import { supabase } from '@/integrations/supabase/client';

const ExploreWithFreemium = () => {
  const { limits, trackUsage, isPremium } = useFreemiumLimits();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<'contact' | 'filters' | 'favorites' | 'matchmaker'>('filters');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('dog_listings')
        .select(`
          *,
          profiles:user_id (
            full_name,
            verified
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterUsage = () => {
    if (limits.filtersUsed >= limits.maxFilters && !isPremium) {
      setUpgradeReason('filters');
      setShowUpgradePrompt(true);
      return false;
    }
    trackUsage('advanced_filters');
    return true;
  };

  const handleFavoriteClick = () => {
    if (limits.favoritesUsed >= limits.maxFavorites && !isPremium) {
      setUpgradeReason('favorites');
      setShowUpgradePrompt(true);
      return false;
    }
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

      <ExploreContainer listings={listings} />

      {/* Sponsored Listing Ad */}
      <div className="container mx-auto px-4 mb-6">
        <AdBanner targetPage="explore" format="sponsored" className="max-w-4xl mx-auto" />
      </div>

      <PremiumUpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        trigger={upgradeReason}
      />
    </div>
  );
};

export default ExploreWithFreemium;
