
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pb-16 md:pb-0">
        {children || <Outlet />}
      </main>
      {user && <BottomNavigation />}
    </div>
  );
};

export default Layout;
