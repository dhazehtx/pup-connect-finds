
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';

interface FreemiumLimits {
  canContactBreeder: boolean;
  contactsRemaining: number;
  canUsePremiumFilters: boolean;
  canAccessMatchmaker: boolean;
  canViewPremiumContent: boolean;
  hasVerifiedBadge: boolean;
  maxFavorites: number;
  favoritesUsed: number;
  filtersUsed: number;
  maxFilters: number;
}

export const useFreemiumLimits = () => {
  const { user } = useAuth();
  const { subscription_tier, subscribed } = useSubscription();
  const [limits, setLimits] = useState<FreemiumLimits>({
    canContactBreeder: true,
    contactsRemaining: 3,
    canUsePremiumFilters: false,
    canAccessMatchmaker: false,
    canViewPremiumContent: false,
    hasVerifiedBadge: false,
    maxFavorites: 10,
    favoritesUsed: 0,
    filtersUsed: 0,
    maxFilters: 2
  });

  const isPremium = subscribed && (subscription_tier === 'Pro' || subscription_tier === 'Enterprise');

  useEffect(() => {
    if (!user) return;

    const loadUsageData = async () => {
      // Get premium usage tracking
      const { data: usageData } = await supabase
        .from('premium_usage')
        .select('*')
        .eq('user_id', user.id);

      // Get favorites count
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id);

      const contactsUsed = usageData?.find(u => u.feature_name === 'breeder_contact')?.usage_count || 0;
      const filtersUsed = usageData?.find(u => u.feature_name === 'advanced_filters')?.usage_count || 0;

      setLimits({
        canContactBreeder: isPremium || contactsUsed < 3,
        contactsRemaining: isPremium ? Infinity : Math.max(0, 3 - contactsUsed),
        canUsePremiumFilters: isPremium,
        canAccessMatchmaker: isPremium,
        canViewPremiumContent: isPremium,
        hasVerifiedBadge: isPremium,
        maxFavorites: isPremium ? Infinity : 10,
        favoritesUsed: favoritesData?.length || 0,
        filtersUsed,
        maxFilters: isPremium ? Infinity : 2
      });
    };

    loadUsageData();
  }, [user, isPremium, subscription_tier]);

  const trackUsage = async (featureName: string) => {
    if (!user || isPremium) return;

    await supabase.from('premium_usage').upsert({
      user_id: user.id,
      feature_name: featureName,
      usage_count: 1,
      last_used_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,feature_name',
      ignoreDuplicates: false
    });
  };

  return { limits, trackUsage, isPremium };
};
