
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
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pb-16 md:pb-0 text-gray-900 bg-white min-h-screen">
        {children || <Outlet />}
      </main>
      {user && <BottomNavigation />}
      <Footer />
    </div>
  );
};

export default Layout;
