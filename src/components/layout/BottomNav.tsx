
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, MessageCircle, User, Store } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: Store, label: 'Marketplace', path: '/marketplace' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center p-2 text-xs ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Icon 
                className={`w-6 h-6 mb-1 ${
                  isActive ? 'fill-current' : ''
                }`} 
              />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
