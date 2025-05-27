
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

  const handleNavigation = (path: string) => {
    // Add haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    navigate(path);
  };

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
                onClick={() => handleNavigation(item.path)}
                className={`relative flex flex-col items-center p-3 rounded-xl transition-all duration-300 transform ${
                  item.isSpecial
                    ? 'bg-gradient-to-r from-royal-blue to-deep-navy text-cloud-white shadow-md scale-110 hover:scale-115'
                    : isActive 
                      ? 'text-cloud-white bg-gradient-to-r from-royal-blue to-deep-navy shadow-md scale-105' 
                      : 'text-royal-blue hover:text-deep-navy hover:bg-soft-sky hover:scale-105'
                } active:scale-95`}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active indicator dot */}
                {isActive && !item.isSpecial && (
                  <div className="absolute -top-1 w-1 h-1 bg-cloud-white rounded-full animate-pulse" />
                )}
                
                <Icon size={item.isSpecial ? 24 : 20} className="transition-transform" />
                <span className={`text-xs mt-1 font-medium transition-all ${
                  isActive ? 'font-semibold' : ''
                }`}>
                  {item.label}
                </span>
                
                {/* Ripple effect container */}
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 bg-white/20 rounded-xl scale-0 animate-ping" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
