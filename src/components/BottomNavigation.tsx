
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import GuestPrompt from '@/components/GuestPrompt';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
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

  const handleCreateAction = () => {
    if (!user && !isGuest) {
      setPromptAction('create content');
      setShowGuestPrompt(true);
      return;
    }
    
    // Show options for creating content
    toast({
      title: "Create",
      description: "Navigate to home to create posts or stories",
    });
    navigate('/');
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
      label: 'Create',
      path: '/create',
      protected: true,
      action: 'create content',
      onClick: handleCreateAction
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
    if (path === '/create') {
      return false; // Create button should not show as active
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-lg">
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
                  console.log('Button clicked for:', item.label, item.path);
                  item.onClick();
                }}
                className={`flex flex-col items-center justify-center p-2 transition-colors ${
                  active 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
                type="button"
                aria-label={item.label}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
                {item.protected && !user && !isGuest && (
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
