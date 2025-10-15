'use client';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from '@/stores/useOnboarding';

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

      // 3) Fetch provider data using real userId (UUID) matched against user_id
      const { data, error } = await (supabase as any)
        .from('providers')
        .select('stripe_account_id, stripe_connected')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (!error && data?.stripe_account_id) {
        setStripeAccountId(data.stripe_account_id);
      }

      // 4) Restore the payout gate (if already done earlier)
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