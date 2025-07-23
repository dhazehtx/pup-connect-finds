
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, MessageCircle, Bell, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationBadge from '@/components/ui/notification-badge';
import GuestPrompt from '@/components/GuestPrompt';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const { unreadCount = 0 } = useNotifications() || {};
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [promptAction, setPromptAction] = useState('');

  const handleProtectedNavigation = (path: string, action: string) => {
    if (!user && !isGuest) {
      setPromptAction(action);
      setShowGuestPrompt(true);
      return;
    }
    console.log('Navigating to protected route:', path);
    navigate(path);
  };

  const handleNavigation = (path: string) => {
    console.log('Navigating to public route:', path);
    navigate(path);
  };

  const navItems = [
    {
      icon: Home,
      label: 'Home',
      path: '/home',
      protected: true,
      onClick: () => handleProtectedNavigation('/home', 'view your home feed')
    },
    {
      icon: Search,
      label: 'Explore',
      path: '/explore',
      protected: false,
      onClick: () => handleNavigation('/explore')
    },
    {
      icon: ShoppingBag,
      label: 'Marketplace',
      path: '/marketplace',
      protected: false,
      onClick: () => handleNavigation('/marketplace')
    },
    {
      icon: MessageCircle,
      label: 'Messages',
      path: '/messages',
      protected: true,
      onClick: () => handleProtectedNavigation('/messages', 'access your messages')
    },
    {
      icon: Bell,
      label: 'Notifications',
      path: '/notifications',
      protected: true,
      showBadge: true,
      badgeCount: unreadCount,
      onClick: () => handleProtectedNavigation('/notifications', 'view your notifications')
    },
    {
      icon: User,
      label: 'Profile',
      path: '/profile',
      protected: true,
      onClick: () => handleProtectedNavigation('/profile', 'view your profile')
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

  console.log('BottomNavigation rendering with navItems:', navItems);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-sm">
        <div className="grid grid-cols-6 h-16">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            console.log(`Rendering nav item ${index}: ${item.label}`);
            
            return (
              <button
                key={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Button clicked for:', item.label, item.path);
                  item.onClick();
                }}
                className={`flex flex-col items-center justify-center p-2 transition-colors relative ${
                  active 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
                type="button"
                aria-label={item.label}
              >
                <div className="relative">
                  <Icon size={20} className="flex-shrink-0" />
                  {item.showBadge && item.badgeCount && item.badgeCount > 0 && (
                    <div className="absolute -top-1 -right-1">
                      <NotificationBadge count={item.badgeCount} className="text-xs" />
                    </div>
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{item.label}</span>
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
