
import React from 'react';
import { useLocation } from 'react-router-dom';
import Footer from './Footer';
import BottomNavigation from './BottomNavigation';
import FloatingTrustButton from './safety/FloatingTrustButton';
import StickyHeader from './layout/StickyHeader';
import { useSessionManager } from '@/hooks/useSessionManager';
import SessionWarningModal from '@/components/auth/SessionWarningModal';

interface LayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

const Layout = ({ children, showBottomNav = true }: LayoutProps) => {
  const location = useLocation();
  // Initialize session management (timeout & token refresh)
  const { showWarningModal, handleExtendSession, handleManualLogout } = useSessionManager();

  // Hide sticky header and footer on greeting page for clean design
  const showStickyHeader = location.pathname !== '/greeting';
  const showFooter = location.pathname !== '/greeting';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showStickyHeader && <StickyHeader />}
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      {showFooter && <Footer />}
      {showBottomNav && <BottomNavigation />}
      <FloatingTrustButton />
      
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
