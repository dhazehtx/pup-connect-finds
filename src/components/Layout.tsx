import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import BottomNavigation from './BottomNavigation';
import FloatingTrustButton from './safety/FloatingTrustButton';

interface LayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

const Layout = ({ children, showBottomNav = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      <Footer />
      {showBottomNav && <BottomNavigation />}
      <FloatingTrustButton />
    </div>
  );
};

export default Layout;
