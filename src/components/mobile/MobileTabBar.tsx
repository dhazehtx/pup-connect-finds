
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, ShoppingBag, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileOptimized } from '@/hooks/useMobileOptimized';

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  requiresAuth?: boolean;
}

const MobileTabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile, safeAreaInsets } = useMobileOptimized();

  if (!isMobile) return null;

  const tabs: TabItem[] = [
    { id: 'home', label: 'Home', icon: <Home size={24} />, path: '/home' },
    { id: 'explore', label: 'Explore', icon: <Search size={24} />, path: '/explore' },
    { id: 'marketplace', label: 'Marketplace', icon: <ShoppingBag size={24} />, path: '/marketplace' },
    { id: 'messages', label: 'Messages', icon: <MessageCircle size={24} />, path: '/messages' },
    { id: 'profile', label: 'Profile', icon: <User size={24} />, path: '/profile' }
  ];

  const handleTabClick = (tab: TabItem) => {
    navigate(tab.path);
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"
      style={{ paddingBottom: safeAreaInsets.bottom }}
    >
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path || 
            (tab.path === '/home' && location.pathname === '/') ||
            (tab.path === '/explore' && (location.pathname === '/' || location.pathname === '/explore'));
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={cn(
                'flex flex-col items-center justify-center p-3 min-w-[60px] touch-manipulation',
                'transition-colors duration-200',
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <div className={cn(
                'transition-transform duration-200 mb-1',
                isActive && 'scale-110'
              )}>
                {tab.icon}
              </div>
              <span className={cn(
                'text-xs font-medium',
                isActive && 'text-blue-600'
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileTabBar;
