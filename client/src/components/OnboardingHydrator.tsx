'use client';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from '@/stores/useOnboarding';
import { fetchProviderStripeStatus } from '@/lib/providerStripe';

export default function OnboardingHydrator() {
  const { providerId, setProviderId, setApplicationId, setStripeAccountId, setPayoutSetupComplete } = useOnboarding();
  
  useEffect(() => {
    (async () => {
      // 1) Get the authenticated user's ID
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      
      if (!userId) {
        console.warn('[OnboardingHydrator] No authenticated user');
        return;
      }

      // 2) Restore providerId from sessionStorage for compatibility
      const pid = sessionStorage.getItem('providerId');
      if (pid && !providerId) setProviderId(pid);

      // 3) Fetch Stripe data from profiles using centralized helper
      try {
        const stripeData = await fetchProviderStripeStatus(userId);
        if (stripeData?.stripe_account_id) {
          setStripeAccountId(stripeData.stripe_account_id);
        }
        if (stripeData?.stripe_connected) {
          setPayoutSetupComplete(true);
        }
      } catch (error) {
        console.warn('[OnboardingHydrator] Error fetching Stripe status:', error);
      }

      // 4) Restore the payout gate from sessionStorage if needed
      if (sessionStorage.getItem('payoutDone') === '1') {
        setPayoutSetupComplete(true);
      }
    })();
    
    // Hydrate applicationId from localStorage
    const appId = localStorage.getItem('applicationId');
    if (appId) setApplicationId(appId);
  }, [providerId, setProviderId, setApplicationId, setStripeAccountId, setPayoutSetupComplete]);
  
  return null;
}