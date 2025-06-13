
import { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { PRICING_CONFIG, SubscriptionTier } from '@/config/pricing';

interface SubscriptionLimits {
  maxListings: number;
  messagesPerDay: number;
  featuredListingsPerMonth: number;
  hasAnalytics: boolean;
  hasPrioritySupport: boolean;
  hasVerificationBadge: boolean;
  hasAPI: boolean;
  teamMembers: number;
}

export const useSubscriptionTiers = () => {
  const { subscribed, subscription_tier } = useSubscription();
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);

  useEffect(() => {
    const tier = (subscription_tier?.toLowerCase() || 'basic') as SubscriptionTier;
    
    const tierLimits: Record<SubscriptionTier, SubscriptionLimits> = {
      basic: {
        maxListings: 2,
        messagesPerDay: 5,
        featuredListingsPerMonth: 0,
        hasAnalytics: false,
        hasPrioritySupport: false,
        hasVerificationBadge: false,
        hasAPI: false,
        teamMembers: 1,
      },
      pro: {
        maxListings: -1, // Unlimited
        messagesPerDay: -1, // Unlimited
        featuredListingsPerMonth: 1,
        hasAnalytics: true,
        hasPrioritySupport: true,
        hasVerificationBadge: true,
        hasAPI: false,
        teamMembers: 1,
      },
      business: {
        maxListings: -1, // Unlimited
        messagesPerDay: -1, // Unlimited
        featuredListingsPerMonth: -1, // Unlimited
        hasAnalytics: true,
        hasPrioritySupport: true,
        hasVerificationBadge: true,
        hasAPI: true,
        teamMembers: 5,
      },
    };

    setLimits(tierLimits[tier]);
  }, [subscription_tier]);

  const canAccessFeature = (feature: keyof SubscriptionLimits): boolean => {
    if (!limits) return false;
    
    const value = limits[feature];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    return false;
  };

  const isAtLimit = (feature: 'listings' | 'messages', currentCount: number): boolean => {
    if (!limits) return true;
    
    const limit = feature === 'listings' ? limits.maxListings : limits.messagesPerDay;
    if (limit === -1) return false; // Unlimited
    return currentCount >= limit;
  };

  const getRemainingUsage = (feature: 'listings' | 'messages', currentCount: number): number => {
    if (!limits) return 0;
    
    const limit = feature === 'listings' ? limits.maxListings : limits.messagesPerDay;
    if (limit === -1) return Infinity; // Unlimited
    return Math.max(0, limit - currentCount);
  };

  return {
    limits,
    subscription_tier: subscription_tier as SubscriptionTier || 'basic',
    subscribed,
    canAccessFeature,
    isAtLimit,
    getRemainingUsage,
  };
};
