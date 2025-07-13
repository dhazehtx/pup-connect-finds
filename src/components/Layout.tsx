
import React from 'react';
import Footer from './Footer';
import BottomNavigation from './BottomNavigation';
import FloatingTrustButton from './safety/FloatingTrustButton';
import StickyHeader from './layout/StickyHeader';

interface LayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

const Layout = ({ children, showBottomNav = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 unified-theme">
      <StickyHeader />
      <main className="flex-1 pb-16 md:pb-0 bg-white">
        {children}
      </main>
      <Footer />
      {showBottomNav && <BottomNavigation />}
      <FloatingTrustButton />
    </div>
  );
};

export default Layout;
