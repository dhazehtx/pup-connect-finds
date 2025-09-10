'use client';
import { useEffect } from 'react';
import { useOnboarding } from '@/stores/useOnboarding';

export default function OnboardingHydrator() {
  const { setProviderId, setApplicationId, setPayoutSetupComplete } = useOnboarding();
  
  useEffect(() => {
    // Hydrate providerId from sessionStorage
    const pid = sessionStorage.getItem('providerId');
    if (pid) setProviderId(pid);
    
    // Hydrate applicationId from localStorage
    const appId = localStorage.getItem('applicationId');
    if (appId) setApplicationId(appId);
    
    // Hydrate payout completion status from sessionStorage
    const done = sessionStorage.getItem('payoutDone') === '1';
    if (done) setPayoutSetupComplete(true);
  }, [setProviderId, setApplicationId, setPayoutSetupComplete]);
  
  return null;
}