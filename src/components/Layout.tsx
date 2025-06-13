
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import BottomNavigation from './BottomNavigation';
import MobileTabBar from './mobile/MobileTabBar';
import MobileNavigation from './mobile/MobileNavigation';
import StickyBottomNavigation from './StickyBottomNavigation';
import PWAInstallPrompt from './pwa/PWAInstallPrompt';
import OfflineIndicator from './pwa/OfflineIndicator';
import ServiceWorkerManager from './pwa/ServiceWorkerManager';
import { useMobileOptimized } from '@/hooks/useMobileOptimized';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isMobile } = useMobileOptimized();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      {/* PWA Components */}
      <OfflineIndicator />
      <PWAInstallPrompt />
      <ServiceWorkerManager />
      
      <main className={cn(
        "flex-1",
        isMobile ? "pb-20" : "pb-32"
      )}>
        {children}
      </main>

      {/* Add sticky bottom navigation for all screens */}
      <StickyBottomNavigation />

      {/* Footer for all screens */}
      <Footer />

      {/* Mobile navigation - choose between MobileTabBar and MobileNavigation */}
      {isMobile && <MobileNavigation />}
    </div>
  );
};

export default Layout;
