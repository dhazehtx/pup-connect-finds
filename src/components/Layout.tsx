
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import Footer from './Footer';
import OnboardingFlow from './onboarding/OnboardingFlow';
import MobileOptimizedLayout from './mobile/MobileOptimizedLayout';
import MobileTabBar from './mobile/MobileTabBar';
import SEOHead from './seo/SEOHead';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useMobileOptimized } from '@/hooks/useMobileOptimized';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, loading, isGuest } = useAuth();
  const { hasSeenOnboarding, completeOnboarding } = useOnboarding();
  const { isMobile } = useMobileOptimized();
  const { reportVitals } = usePerformanceMonitor();
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

  useEffect(() => {
    // Report page navigation performance
    const navigationTime = performance.now();
    reportVitals('page-navigation', navigationTime);
  }, [location.pathname, reportVitals]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    completeOnboarding();
  };

  // Show onboarding flow for new visitors
  if (showOnboarding) {
    return (
      <HelmetProvider>
        <SEOHead title="Welcome to MY PUP" />
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </HelmetProvider>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <HelmetProvider>
        <SEOHead title="Loading..." />
        <MobileOptimizedLayout>
          <div className="min-h-screen bg-gradient-to-br from-royal-blue/10 to-mint-green/10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-royal-blue border-t-transparent" />
          </div>
        </MobileOptimizedLayout>
      </HelmetProvider>
    );
  }

  // Only hide header on auth page
  const isAuthPage = location.pathname === '/auth';

  return (
    <HelmetProvider>
      <SEOHead />
      <MobileOptimizedLayout enableSafeArea={true}>
        <div className="min-h-screen bg-gradient-to-br from-royal-blue/10 to-mint-green/10 flex flex-col">
          {!isAuthPage && !isMobile && <Header />}
          <main className={`flex-1 ${isMobile ? 'pb-20' : 'pb-20'}`}>
            {children}
          </main>
          {!isAuthPage && !isMobile && <Footer />}
          {!isAuthPage && isMobile && <MobileTabBar />}
          {!isAuthPage && !isMobile && <BottomNavigation />}
        </div>
      </MobileOptimizedLayout>
    </HelmetProvider>
  );
};

export default Layout;
