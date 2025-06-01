
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EnhancedSubscriptionState {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  trial_end: string | null;
  loading: boolean;
  error: string | null;
  isTrialing: boolean;
  daysUntilExpiry: number | null;
  canUpgrade: boolean;
  canDowngrade: boolean;
}

interface SubscriptionError {
  type: 'network' | 'payment' | 'authentication' | 'unknown';
  message: string;
  retryable: boolean;
}

export const useEnhancedSubscription = () => {
  const [subscriptionState, setSubscriptionState] = useState<EnhancedSubscriptionState>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    trial_end: null,
    loading: true,
    error: null,
    isTrialing: false,
    daysUntilExpiry: null,
    canUpgrade: false,
    canDowngrade: false
  });
  
  const { user, session } = useAuth();
  const { toast } = useToast();

  const calculateDaysUntilExpiry = (endDate: string | null, trialEnd: string | null) => {
    const relevantDate = trialEnd || endDate;
    if (!relevantDate) return null;
    
    const now = new Date();
    const expiry = new Date(relevantDate);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const determineUpgradeDowngradeOptions = (currentTier: string | null) => {
    const tiers = ['Basic', 'Pro', 'Enterprise'];
    const currentIndex = currentTier ? tiers.indexOf(currentTier) : -1;
    
    return {
      canUpgrade: currentIndex < tiers.length - 1 && currentIndex >= 0,
      canDowngrade: currentIndex > 0
    };
  };

  const checkSubscription = async (retryCount = 0) => {
    if (!user || !session) {
      setSubscriptionState(prev => ({ 
        ...prev, 
        loading: false,
        error: 'User not authenticated'
      }));
      return;
    }

    try {
      setSubscriptionState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      const daysUntilExpiry = calculateDaysUntilExpiry(data.subscription_end, data.trial_end);
      const isTrialing = data.trial_end && new Date(data.trial_end) > new Date();
      const upgradeDowngradeOptions = determineUpgradeDowngradeOptions(data.subscription_tier);

      setSubscriptionState({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || null,
        subscription_end: data.subscription_end || null,
        trial_end: data.trial_end || null,
        loading: false,
        error: null,
        isTrialing: isTrialing || false,
        daysUntilExpiry,
        ...upgradeDowngradeOptions
      });

      // Show expiry warnings
      if (daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        const message = isTrialing 
          ? `Your trial expires in ${daysUntilExpiry} days`
          : `Your subscription expires in ${daysUntilExpiry} days`;
        
        toast({
          title: "Subscription Expiring Soon",
          description: message,
          variant: "destructive"
        });
      }

    } catch (error: any) {
      const subscriptionError = categorizeError(error);
      
      setSubscriptionState(prev => ({ 
        ...prev, 
        loading: false,
        error: subscriptionError.message
      }));

      // Retry logic for retryable errors
      if (subscriptionError.retryable && retryCount < 3) {
        setTimeout(() => {
          checkSubscription(retryCount + 1);
        }, Math.pow(2, retryCount) * 1000); // Exponential backoff
      } else {
        toast({
          title: "Subscription Check Failed",
          description: subscriptionError.message,
          variant: "destructive"
        });
      }
    }
  };

  const categorizeError = (error: any): SubscriptionError => {
    const message = error?.message || 'Unknown error occurred';
    
    if (message.includes('network') || message.includes('fetch')) {
      return {
        type: 'network',
        message: 'Network error. Please check your connection.',
        retryable: true
      };
    }
    
    if (message.includes('authentication') || message.includes('unauthorized')) {
      return {
        type: 'authentication',
        message: 'Authentication failed. Please sign in again.',
        retryable: false
      };
    }
    
    if (message.includes('payment') || message.includes('billing')) {
      return {
        type: 'payment',
        message: 'Payment issue detected. Please update your payment method.',
        retryable: false
      };
    }
    
    return {
      type: 'unknown',
      message: 'Something went wrong. Please try again.',
      retryable: true
    };
  };

  const createCheckoutWithTrial = async (tier: string, trialDays = 14) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubscriptionState(prev => ({ ...prev, loading: true }));

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier, trialDays },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      window.open(data.url, '_blank');
    } catch (error: any) {
      const subscriptionError = categorizeError(error);
      toast({
        title: "Checkout Failed",
        description: subscriptionError.message,
        variant: "destructive"
      });
    } finally {
      setSubscriptionState(prev => ({ ...prev, loading: false }));
    }
  };

  const upgradePlan = async (newTier: string) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upgrade",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('upgrade-subscription', {
        body: { newTier },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Upgrade Successful",
        description: `Your plan has been upgraded to ${newTier}`,
      });

      await checkSubscription();
    } catch (error: any) {
      const subscriptionError = categorizeError(error);
      toast({
        title: "Upgrade Failed",
        description: subscriptionError.message,
        variant: "destructive"
      });
    }
  };

  const openCustomerPortal = async () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage your subscription",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      window.open(data.url, '_blank');
    } catch (error: any) {
      const subscriptionError = categorizeError(error);
      toast({
        title: "Portal Access Failed",
        description: subscriptionError.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user, session]);

  return {
    ...subscriptionState,
    checkSubscription,
    createCheckoutWithTrial,
    upgradePlan,
    openCustomerPortal,
    refreshSubscription: checkSubscription
  };
};
