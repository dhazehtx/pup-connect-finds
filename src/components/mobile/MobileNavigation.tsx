
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

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

const MobileNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile, safeAreaInsets } = useMobileOptimized();

  if (!isMobile) return null;

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-5 h-5" />,
      path: '/explore'
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
      badge: 2
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
      path: '/profile'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/explore') {
      return location.pathname === path || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50"
      style={{ paddingBottom: safeAreaInsets.bottom }}
    >
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 h-auto min-w-[60px] relative",
              isActive(item.path) && "text-primary"
            )}
          >
            <div className="relative">
              {item.icon}
              {item.badge && item.badge > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 text-xs w-5 h-5 flex items-center justify-center p-0"
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
