
import React from 'react';
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: Plus, label: 'Post', path: '/post', isSpecial: true },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: User, label: 'Profile', path: '/profile/1' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-cloud-white/98 backdrop-blur-md border-t border-soft-sky shadow-lg z-50">
      <div className="max-w-4xl mx-auto px-2 py-3">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path === '/explore' && location.pathname === '/map');
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
                  item.isSpecial
                    ? 'bg-gradient-to-r from-royal-blue to-deep-navy text-cloud-white shadow-md scale-110'
                    : isActive 
                      ? 'text-cloud-white bg-gradient-to-r from-royal-blue to-deep-navy shadow-md scale-105' 
                      : 'text-royal-blue hover:text-deep-navy hover:bg-soft-sky'
                }`}
              >
                <Icon size={item.isSpecial ? 24 : 20} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
