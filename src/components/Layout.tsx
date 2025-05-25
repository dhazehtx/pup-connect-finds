
import React from 'react';
import { useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isNotificationsPage = location.pathname === '/notifications';
  
  return (
    <div className="min-h-screen bg-cloud-white">
      <Header />
      <main className="pb-20 pt-24">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Layout;
