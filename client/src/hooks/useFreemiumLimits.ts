
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { apiRequest } from '@/lib/api';

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
      const usageData: any[] = [];
      console.log('[PROOF:DEV_ONLY] premium_usage tracking uses local defaults - Neon-only policy');

      let favoritesData: any[] = [];
      try {
        const favIds = await apiRequest(`/api/favorites/ids/${user.id}`);
        favoritesData = (favIds?.ids || []).map((id: string) => ({ id }));
      } catch {}

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
    console.log('[PROOF:DEV_ONLY] premium_usage upsert skipped - Neon-only policy', { featureName });
  };

  return { limits, trackUsage, isPremium };
};
