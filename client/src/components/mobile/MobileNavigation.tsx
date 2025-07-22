
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Search, 
  ShoppingBag, 
  MessageCircle, 
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileOptimized } from '@/hooks/useMobileOptimized';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  requiresAuth?: boolean;
}

const MobileNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile, safeAreaInsets } = useMobileOptimized();
  const { user, isGuest } = useAuth();

  if (!isMobile) return null;

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-5 h-5" />,
      path: '/home',
      requiresAuth: true
    },
    {
      id: 'explore',
      label: 'Explore',
      icon: <Search className="w-5 h-5" />,
      path: '/explore'
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      icon: <ShoppingBag className="w-5 h-5" />,
      path: '/marketplace'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: <MessageCircle className="w-5 h-5" />,
      path: '/messages',
      badge: 2,
      requiresAuth: true
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
      path: '/profile',
      requiresAuth: true
    }
  ];

  const isActive = (path: string) => {
    if (path === '/home') {
      // Home button is active when on /home OR when on root path (/) after being redirected
      return location.pathname === '/home' || location.pathname === '/';
    }
    if (path === '/explore') {
      // Explore button is only active when specifically on /explore
      return location.pathname === '/explore';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (item: NavItem) => {
    // If the item requires auth and user is not authenticated, redirect to greeting page
    if (item.requiresAuth && !user && !isGuest) {
      navigate('/');
      return;
    }
    navigate(item.path);
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-blue-200 z-50 shadow-lg"
      style={{ paddingBottom: safeAreaInsets.bottom }}
    >
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={() => handleNavigation(item)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 h-auto min-w-[60px] relative transition-colors",
              isActive(item.path) 
                ? "text-blue-600 bg-blue-50" 
                : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
            )}
          >
            <div className="relative">
              {item.icon}
              {item.badge && item.badge > 0 && (user || isGuest) && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 text-xs w-5 h-5 flex items-center justify-center p-0 bg-blue-600 hover:bg-blue-700"
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </Badge>
              )}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
