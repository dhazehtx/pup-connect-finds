
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, ShoppingBag, MessageCircle, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { logNav } from '@/lib/adminLog';

const DEBUG = import.meta.env.DEV && false;

import GuestPrompt from '@/components/GuestPrompt';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isGuest } = useAuth();

  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [promptAction, setPromptAction] = useState('');

  const handleProtectedNavigation = async (path: string, action: string) => {
    if (DEBUG) console.debug('[NAV CLICK]', path.replace('/', ''));
    if (DEBUG) console.debug('[BOTTOM NAV] Protected navigation guard:', {
      currentPath: location.pathname,
      targetPath: path,
      hasUser: !!user,
      isGuest,
      shouldRedirect: !user && !isGuest
    });

    if (location.pathname === path) {
      if (DEBUG) console.debug('[BOTTOM NAV] Already on target path, skipping navigation');
      return;
    }

    if (!user && !isGuest) {
      if (DEBUG) console.debug('[BOTTOM NAV] Redirecting unauthenticated user to greeting');
      navigate('/greeting', { replace: true });
      return;
    }
    
    try {
      logNav({ from: location.pathname, to: path });
      navigate(path);
      if (DEBUG) console.debug('[BOTTOM NAV] Protected navigation to', path, 'completed successfully');
    } catch (error) {
      console.error('[BOTTOM NAV] Protected navigation error to', path, ':', error);
      window.location.href = path;
    }
  };

  const handleNavigation = (path: string) => {
    if (DEBUG) console.debug('[NAV CLICK]', path.replace('/', ''));
    if (DEBUG) console.debug('[BOTTOM NAV] Regular navigation:', {
      currentPath: location.pathname,
      targetPath: path
    });

    if (location.pathname === path) {
      if (DEBUG) console.debug('[BOTTOM NAV] Already on target path, skipping navigation');
      return;
    }

    try {
      logNav({ from: location.pathname, to: path });
      navigate(path);
      if (DEBUG) console.debug('[BOTTOM NAV] Regular navigation to', path, 'completed successfully');
    } catch (error) {
      console.error('[BOTTOM NAV] Regular navigation error to', path, ':', error);
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
      icon: Compass,
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
      {/* Mobile-only: hidden at md+ (desktop). Layout already sets md:pb-0 assuming
          this bar is gone on desktop; without md:hidden it wrongly showed at desktop width. */}
      <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-40 safe-area-bottom rounded-t-2xl text-white md:hidden md:rounded-none">
        <div className="grid h-16 grid-cols-5" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}>
          {navItems.map((item) => {
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
                className={`relative mx-0.5 flex min-h-[48px] touch-manipulation flex-col items-center justify-center rounded-xl p-2 transition-colors ${
                  active ? 'bottom-nav__item--active' : 'bottom-nav__item--inactive hover:bg-white/10 active:bg-white/[0.12]'
                }`}
                type="button"
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className="relative">
                  <Icon
                    className="bottom-nav__icon h-[22px] w-[22px] shrink-0"
                    strokeWidth={active ? 2.25 : 2}
                    aria-hidden
                  />
                </div>
                <span
                  className="mt-0.5 text-[11px] font-medium leading-tight"
                >
                  {item.label}
                </span>
                {item.protected && !user && !isGuest && (
                  <div
                    className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-300 ring-1 ring-blue-900/20"
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {showGuestPrompt && (
        <GuestPrompt
          action={promptAction}
          description={`To ${promptAction}, sign in or create a PAWS account.`}
          onCancel={() => setShowGuestPrompt(false)}
        />
      )}
    </>
  );
};

export default BottomNavigation;
