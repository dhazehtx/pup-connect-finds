
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, MessageCircle, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { logNav } from '@/lib/adminLog';

import GuestPrompt from '@/components/GuestPrompt';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isGuest } = useAuth();
  const { toast } = useToast();

  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [promptAction, setPromptAction] = useState('');

  // PROTECTED NAVIGATION with diagnostics
  const handleProtectedNavigation = async (path: string, action: string) => {
    console.log('[NAV CLICK]', path.replace('/', ''));
    console.log('[BOTTOM NAV] Protected navigation guard:', {
      currentPath: location.pathname,
      targetPath: path,
      hasUser: !!user,
      isGuest,
      shouldRedirect: !user && !isGuest
    });

    // Skip navigation if already on target path
    if (location.pathname === path) {
      console.log('[BOTTOM NAV] Already on target path, skipping navigation');
      return;
    }

    if (!user && !isGuest) {
      console.log('[BOTTOM NAV] Redirecting unauthenticated user to greeting');
      navigate('/greeting', { replace: true });
      return;
    }
    
    try {
      logNav({ from: location.pathname, to: path });
      navigate(path);
      console.log('[BOTTOM NAV] Protected navigation to', path, 'completed successfully');
    } catch (error) {
      console.error('[BOTTOM NAV] Protected navigation error to', path, ':', error);
      // Force navigation as fallback
      window.location.href = path;
    }
  };

  const handleNavigation = (path: string) => {
    console.log('[NAV CLICK]', path.replace('/', ''));
    console.log('[BOTTOM NAV] Regular navigation:', {
      currentPath: location.pathname,
      targetPath: path
    });

    // Skip navigation if already on target path
    if (location.pathname === path) {
      console.log('[BOTTOM NAV] Already on target path, skipping navigation');
      return;
    }

    try {
      logNav({ from: location.pathname, to: path });
      navigate(path);
      console.log('[BOTTOM NAV] Regular navigation to', path, 'completed successfully');
    } catch (error) {
      console.error('[BOTTOM NAV] Regular navigation error to', path, ':', error);
      // Force navigation as fallback
      window.location.href = path;
    }
  };

  const navItems = [
    {
      icon: Home,
      label: 'Home',
      path: '/home',
      protected: true,
      onClick: () => {
        handleProtectedNavigation('/home', 'view your home feed');
      }
    },
    {
      icon: Search,
      label: 'Explore',
      path: '/explore',
      protected: false,
      onClick: () => {
        handleNavigation('/explore');
      }
    },
    {
      icon: ShoppingBag,
      label: 'Marketplace',
      path: '/marketplace',
      protected: false,
      onClick: () => {
        handleNavigation('/marketplace');
      }
    },
    {
      icon: MessageCircle,
      label: 'Messages',
      path: '/messages',
      protected: true,
      onClick: () => {
        handleProtectedNavigation('/messages', 'access your messages');
      }
    },

    {
      icon: User,
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
                className={`flex flex-col items-center justify-center p-2 transition-colors relative text-white min-h-[48px] touch-manipulation ${
                  active 
                    ? 'bg-white/20' 
                    : 'text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20'
                }`}
                type="button"
                aria-label={item.label}
              >
                <div className="relative">
                  <Icon size={22} className="flex-shrink-0" />
                </div>
                <span className="text-[11px] mt-0.5 font-medium text-inherit leading-tight">{item.label}</span>
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
