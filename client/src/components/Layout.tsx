
import React from 'react';
import Footer from './Footer';
import BottomNavigation from './BottomNavigation';

import StickyHeader from './layout/StickyHeader';
import { useSessionManager } from '@/hooks/useSessionManager';
import SessionWarningModal from '@/components/auth/SessionWarningModal';

interface LayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

const Layout = ({ children, showBottomNav = true }: LayoutProps) => {
  // Initialize session management (timeout & token refresh)
  const { showWarningModal, handleExtendSession, handleManualLogout } = useSessionManager();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StickyHeader />
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      <Footer />
      {showBottomNav && <BottomNavigation />}

      
      {/* Session Warning Modal */}
      <SessionWarningModal
        isOpen={showWarningModal}
        onExtendSession={handleExtendSession}
        onLogout={handleManualLogout}
        warningTimeSeconds={120}
      />
    </div>
  );
};

export default Layout;
