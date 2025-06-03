
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import OnboardingFlow from './onboarding/OnboardingFlow';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/hooks/useOnboarding';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, loading, isGuest } = useAuth();
  const { hasSeenOnboarding, completeOnboarding } = useOnboarding();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Show onboarding if user hasn't seen it and isn't logged in or guest
    if (!loading && !user && !isGuest && !hasSeenOnboarding) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [loading, user, isGuest, hasSeenOnboarding]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    completeOnboarding();
  };

  // Show onboarding flow for new visitors
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-royal-blue/10 to-mint-green/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-royal-blue border-t-transparent" />
      </div>
    );
  }

  // Don't render header on auth page only
  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-blue/10 to-mint-green/10">
      {!isAuthPage && <Header />}
      <main className="pb-20">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Layout;
