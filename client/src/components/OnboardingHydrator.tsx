'use client';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from '@/stores/useOnboarding';

export default function OnboardingHydrator() {
  const { providerId, setProviderId, setApplicationId, setStripeAccountId, setPayoutSetupComplete } = useOnboarding();
  
  useEffect(() => {
    (async () => {
      // 1) from sessionStorage
      const pid = sessionStorage.getItem('providerId');
      if (pid && !providerId) setProviderId(pid);

      // 2) fetch provider to get stripe_account_id
      const id = pid || providerId;
      if (!id) return;
      
      const { data, error } = await (supabase as any)
        .from('providers')
        .select('stripe_account_id')
        .eq('id', id)
        .maybeSingle();
        
      if (!error && data?.stripe_account_id) {
        setStripeAccountId(data.stripe_account_id);
      }

      // 3) restore the payout gate (if already done earlier)
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