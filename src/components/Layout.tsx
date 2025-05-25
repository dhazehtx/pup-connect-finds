
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
    <div className={`min-h-screen ${isNotificationsPage ? 'bg-black' : 'bg-gradient-to-br from-blue-50 via-white to-blue-50'}`}>
      {!isNotificationsPage && <Header />}
      <main className={isNotificationsPage ? 'pb-20' : 'pb-20 pt-24'}>
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Layout;
