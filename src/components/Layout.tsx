
import React from 'react';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import MobileTabBar from './mobile/MobileTabBar';
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
        isMobile ? "pb-20" : "pb-16 md:pb-0"
      )}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {isMobile ? <MobileTabBar /> : <BottomNavigation />}
    </div>
  );
};

export default Layout;
