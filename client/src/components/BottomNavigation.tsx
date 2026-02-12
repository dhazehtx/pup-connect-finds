
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { logNav } from '@/lib/adminLog';

const DEBUG_NAV = import.meta.env.DEV && false;

import GuestPrompt from '@/components/GuestPrompt';

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.3-4.3"></path>
  </svg>
);

const ShoppingBagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
    <path d="M3 6h18"></path>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
  </svg>
);

const MessageCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="5"></circle>
    <path d="M20 21a8 8 0 0 0-16 0"></path>
  </svg>
);

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isGuest } = useAuth();
  const { toast } = useToast();

  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [promptAction, setPromptAction] = useState('');

  // PROTECTED NAVIGATION with diagnostics
  const handleProtectedNavigation = async (path: string, action: string) => {
    if (DEBUG_NAV) console.debug('[NAV CLICK]', path.replace('/', ''));
    if (DEBUG_NAV) console.debug('[BOTTOM NAV] Protected navigation guard:', {
      currentPath: location.pathname,
      targetPath: path,
      hasUser: !!user,
      isGuest,
      shouldRedirect: !user && !isGuest
    });

    if (location.pathname === path) {
      if (DEBUG_NAV) console.debug('[BOTTOM NAV] Already on target path, skipping navigation');
      return;
    }

    if (!user && !isGuest) {
      if (DEBUG_NAV) console.debug('[BOTTOM NAV] Redirecting unauthenticated user to greeting');
      navigate('/greeting', { replace: true });
      return;
    }
    
    try {
      logNav({ from: location.pathname, to: path });
      navigate(path);
      if (DEBUG_NAV) console.debug('[BOTTOM NAV] Protected navigation to', path, 'completed successfully');
    } catch (error) {
      console.error('[BOTTOM NAV] Protected navigation error to', path, ':', error);
      window.location.href = path;
    }
  };

  const handleNavigation = (path: string) => {
    if (DEBUG_NAV) console.debug('[NAV CLICK]', path.replace('/', ''));
    if (DEBUG_NAV) console.debug('[BOTTOM NAV] Regular navigation:', {
      currentPath: location.pathname,
      targetPath: path
    });

    if (location.pathname === path) {
      if (DEBUG_NAV) console.debug('[BOTTOM NAV] Already on target path, skipping navigation');
      return;
    }

    try {
      logNav({ from: location.pathname, to: path });
      navigate(path);
      if (DEBUG_NAV) console.debug('[BOTTOM NAV] Regular navigation to', path, 'completed successfully');
    } catch (error) {
      console.error('[BOTTOM NAV] Regular navigation error to', path, ':', error);
      window.location.href = path;
    }
  };

  const navItems = [
    {
      icon: HomeIcon,
      label: 'Home',
      path: '/home',
      protected: true,
      onClick: () => {
        handleProtectedNavigation('/home', 'view your home feed');
      }
    },
    {
      icon: SearchIcon,
      label: 'Explore',
      path: '/explore',
      protected: false,
      onClick: () => {
        handleNavigation('/explore');
      }
    },
    {
      icon: ShoppingBagIcon,
      label: 'Marketplace',
      path: '/marketplace',
      protected: false,
      onClick: () => {
        handleNavigation('/marketplace');
      }
    },
    {
      icon: MessageCircleIcon,
      label: 'Messages',
      path: '/messages',
      protected: true,
      onClick: () => {
        handleProtectedNavigation('/messages', 'access your messages');
      }
    },

    {
      icon: UserIcon,
      label: 'Profile',
      path: '/profile',
      protected: true,
      onClick: () => {
        handleProtectedNavigation('/profile', 'view your profile');
      }
    }
  ];

  const isActive = (path: string) => {
    if (path === '/home') {
      return location.pathname === '/home';
    }
    if (path === '/explore') {
      return location.pathname === '/explore' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bottom-nav border-t border-gray-200 dark:border-gray-700 z-40 shadow-sm safe-area-bottom">
        <div className="grid grid-cols-5 h-16" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}>
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  item.onClick();
                }}
                className={`flex flex-col items-center justify-center p-2 transition-colors relative min-h-[48px] touch-manipulation ${
                  active 
                    ? 'bg-white/20' 
                    : 'hover:bg-white/10 active:bg-white/20'
                }`}
                type="button"
                aria-label={item.label}
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  color: '#ffffff'
                }}
              >
                <div className="relative">
                  <Icon />
                </div>
                <span style={{ fontSize: '11px', marginTop: '2px', fontWeight: 500, color: '#ffffff', lineHeight: 1.2 }}>{item.label}</span>
                {item.protected && !user && !isGuest && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {showGuestPrompt && (
        <GuestPrompt
          action={promptAction}
          description={`To ${promptAction}, you need to create a MY PUP account.`}
          onCancel={() => setShowGuestPrompt(false)}
        />
      )}
    </>
  );
};

export default BottomNavigation;
