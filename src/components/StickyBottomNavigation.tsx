
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, BookOpen, HelpCircle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const StickyBottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      icon: Search,
      label: 'Browse',
      path: '/explore'
    },
    {
      icon: BookOpen,
      label: 'Education',
      path: '/education'
    },
    {
      icon: HelpCircle,
      label: 'Help',
      path: '/help-center'
    },
    {
      icon: Shield,
      label: 'Safety',
      path: '/trust-safety'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-lg">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center p-2 transition-colors',
                active 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              )}
              type="button"
              aria-label={item.label}
            >
              <Icon size={20} className="flex-shrink-0" />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default StickyBottomNavigation;
