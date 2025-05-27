
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import Header from './Header';
import StatusMessage from './ui/status-message';
import { WifiOff, Wifi } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isNotificationsPage = location.pathname === '/notifications';
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-cloud-white">
      <Header />
      
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-orange-500 text-white px-4 py-2 text-center text-sm">
          <WifiOff size={16} className="inline mr-2" />
          You're offline. Some features may not work properly.
        </div>
      )}

      {/* Status messages */}
      <StatusMessage
        type="warning"
        message="You're currently offline"
        show={showOfflineMessage}
        onClose={() => setShowOfflineMessage(false)}
        autoClose={false}
      />

      <main className={`pb-20 ${!isOnline ? 'pt-24' : 'pt-16'}`}>
        {children}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Layout;
