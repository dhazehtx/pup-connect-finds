
import { useState, useEffect } from 'react';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [canRevisit, setCanRevisit] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding before
    const seenOnboarding = localStorage.getItem('hasSeenOnboarding');
    const onboardingVersion = localStorage.getItem('onboardingVersion');
    const currentVersion = '1.0';
    
    if (!seenOnboarding || onboardingVersion !== currentVersion) {
      setShowOnboarding(true);
      setHasSeenOnboarding(false);
    } else {
      setCanRevisit(true);
      setHasSeenOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    localStorage.setItem('onboardingVersion', '1.0');
    localStorage.setItem('onboardingCompletedAt', new Date().toISOString());
    setShowOnboarding(false);
    setHasSeenOnboarding(true);
    setCanRevisit(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('hasSeenOnboarding');
    localStorage.removeItem('onboardingVersion');
    setShowOnboarding(true);
    setHasSeenOnboarding(false);
    setCanRevisit(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    localStorage.setItem('onboardingSkipped', 'true');
    localStorage.setItem('onboardingVersion', '1.0');
    setShowOnboarding(false);
    setHasSeenOnboarding(true);
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
    hasSeenOnboarding,
    canRevisit,
    completeOnboarding,
    resetOnboarding,
    skipOnboarding,
    getOnboardingStats,
  };
};
