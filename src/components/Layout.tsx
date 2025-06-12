
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import BottomNavigation from './BottomNavigation';
import MobileTabBar from './mobile/MobileTabBar';
import StickyBottomNavigation from './StickyBottomNavigation';
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
      
      <main className={cn(
        "flex-1",
        isMobile ? "pb-20" : "pb-32"
      )}>
        {children}
      </main>

      {/* Add sticky bottom navigation for all screens */}
      <StickyBottomNavigation />

      {/* Footer for desktop, mobile tab bar for mobile */}
      {isMobile ? <MobileTabBar /> : <Footer />}
    </div>
  );
};

export default Layout;
