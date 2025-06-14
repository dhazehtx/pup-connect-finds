
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import Footer from './Footer';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, isGuest } = useAuth();
  const location = useLocation();
  
  // Don't show footer on auth pages for cleaner UX
  const hideFooter = location.pathname === '/auth' || location.pathname === '/verify-email';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-4">
        {children || <Outlet />}
      </main>
      {/* Always show bottom navigation for authenticated users and guests */}
      <BottomNavigation />
      {!hideFooter && !user && !isGuest && <Footer />}
    </div>
  );
};

export default Layout;
