
import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationBadgeProps {
  onClick: () => void;
  className?: string;
}

const NotificationBadge = ({ onClick, className = '' }: NotificationBadgeProps) => {
  const { unreadCount } = useNotifications();
  const [prevUnreadCount, setPrevUnreadCount] = useState(unreadCount);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (unreadCount > prevUnreadCount) {
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), 1000);
      return () => clearTimeout(timer);
    }
    setPrevUnreadCount(unreadCount);
  }, [unreadCount, prevUnreadCount]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`relative ${className}`}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge 
          className={`absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs min-w-[20px] transition-all duration-300 ${
            shouldAnimate ? 'animate-pulse scale-110' : ''
          }`}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};

export default NotificationBadge;
