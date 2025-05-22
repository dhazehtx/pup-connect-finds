
import React from 'react';
import { useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Header />
      <main className="pb-20 pt-16">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Layout;
