
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GuestPrompt from '@/components/GuestPrompt';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [promptAction, setPromptAction] = useState('');

  const handleProtectedNavigation = (path: string, action: string) => {
    if (!user) {
      setPromptAction(action);
      setShowGuestPrompt(true);
      return;
    }
    navigate(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const navItems = [
    {
      icon: Home,
      label: 'Home',
      path: '/',
      protected: false,
      onClick: () => handleNavigation('/')
    },
    {
      icon: Search,
      label: 'Explore',
      path: '/explore',
      protected: false,
      onClick: () => handleNavigation('/explore')
    },
    {
      icon: Plus,
      label: 'Post',
      path: '/post',
      protected: true,
      action: 'create listings',
      onClick: () => handleProtectedNavigation('/post', 'create listings')
    },
    {
      icon: MessageCircle,
      label: 'Messages',
      path: '/messages',
      protected: false,
      onClick: () => handleNavigation('/messages')
    },
    {
      icon: User,
      label: 'Profile',
      path: '/profile',
      protected: false,
      onClick: () => handleNavigation('/profile')
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-pb">
        <div className="grid grid-cols-5 h-16">
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
                className={`flex flex-col items-center justify-center p-2 transition-colors relative touch-manipulation cursor-pointer ${
                  active 
                    ? 'text-white bg-blue-600' 
                    : user || !item.protected
                      ? 'text-gray-600 hover:text-blue-600 active:bg-gray-100'
                      : 'text-gray-400'
                }`}
                type="button"
                aria-label={item.label}
                style={{ pointerEvents: 'auto' }}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className="text-xs mt-1 font-medium truncate">{item.label}</span>
                {item.protected && !user && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
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
