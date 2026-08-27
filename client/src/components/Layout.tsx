
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
      {/* Bottom padding clears the fixed BottomNavigation, which is visible below lg
          (mobile + tablet); removed at lg where the desktop nav takes over (lg:pb-0). */}
      <main className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
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
