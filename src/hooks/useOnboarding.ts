
import { useState, useEffect } from 'react';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [canRevisit, setCanRevisit] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    const onboardingVersion = localStorage.getItem('onboardingVersion');
    const currentVersion = '1.0';
    
    if (!hasSeenOnboarding || onboardingVersion !== currentVersion) {
      setShowOnboarding(true);
    } else {
      setCanRevisit(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    localStorage.setItem('onboardingVersion', '1.0');
    localStorage.setItem('onboardingCompletedAt', new Date().toISOString());
    setShowOnboarding(false);
    setCanRevisit(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('hasSeenOnboarding');
    localStorage.removeItem('onboardingVersion');
    setShowOnboarding(true);
    setCanRevisit(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    localStorage.setItem('onboardingSkipped', 'true');
    localStorage.setItem('onboardingVersion', '1.0');
    setShowOnboarding(false);
    setCanRevisit(true);
  };

  const getOnboardingStats = () => {
    const completedAt = localStorage.getItem('onboardingCompletedAt');
    const wasSkipped = localStorage.getItem('onboardingSkipped') === 'true';
    
    return {
      completedAt: completedAt ? new Date(completedAt) : null,
      wasSkipped,
      canRevisit,
    };
  };

  return {
    showOnboarding,
    canRevisit,
    completeOnboarding,
    resetOnboarding,
    skipOnboarding,
    getOnboardingStats,
  };
};
