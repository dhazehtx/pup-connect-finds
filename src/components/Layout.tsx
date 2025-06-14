
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import Footer from './Footer';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, isGuest } = useAuth();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        {children || <Outlet />}
      </main>
      {/* Show bottom navigation for both authenticated users AND guests */}
      {(user || isGuest) && <BottomNavigation />}
      <Footer />
    </div>
  );
};

export default Layout;
