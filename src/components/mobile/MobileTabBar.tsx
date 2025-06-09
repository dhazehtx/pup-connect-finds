
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react';
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
    { id: 'home', label: 'Home', icon: <Home size={20} />, path: '/' },
    { id: 'explore', label: 'Explore', icon: <Search size={20} />, path: '/explore' },
    { id: 'post', label: 'Post', icon: <Plus size={20} />, path: '/post', requiresAuth: true },
    { id: 'messages', label: 'Messages', icon: <MessageCircle size={20} />, path: '/messages' },
    { id: 'profile', label: 'Profile', icon: <User size={20} />, path: '/profile' }
  ];

  const handleTabClick = (tab: TabItem) => {
    navigate(tab.path);
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50"
      style={{ paddingBottom: safeAreaInsets.bottom }}
    >
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path || 
            (tab.path !== '/' && location.pathname.startsWith(tab.path));
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={cn(
                'flex flex-col items-center justify-center p-2 min-w-[60px] touch-manipulation',
                'transition-colors duration-200',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'transition-transform duration-200',
                isActive && 'scale-110'
              )}>
                {tab.icon}
              </div>
              <span className={cn(
                'text-xs mt-1 font-medium',
                isActive && 'text-primary'
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
