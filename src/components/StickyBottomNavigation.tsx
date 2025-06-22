
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, User, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const StickyBottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === '/explore') {
      return location.pathname === path || location.pathname === '/';
    }
    return location.pathname === path;
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/explore' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: ShoppingBag, label: 'Marketplace', path: '/marketplace' },
    { icon: Heart, label: 'Favorites', path: '/favorites' },
    { icon: User, label: 'Profile', path: user ? '/profile' : '/auth' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isCurrentlyActive = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 ${
                isCurrentlyActive 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <item.icon 
                className={`w-5 h-5 mb-1 ${
                  isCurrentlyActive ? 'text-blue-600' : 'text-gray-600'
                }`} 
              />
              <span className={`text-xs font-medium ${
                isCurrentlyActive ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StickyBottomNavigation;
