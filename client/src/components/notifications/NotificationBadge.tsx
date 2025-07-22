
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';

interface NotificationBadgeProps {
  onClick: () => void;
  className?: string;
}

const NotificationBadge = ({ onClick, className = '' }: NotificationBadgeProps) => {
  const { unreadCount } = useEnhancedNotifications();

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
          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs min-w-[20px]"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};

export default NotificationBadge;
