
import React from 'react';
import { Bell } from 'lucide-react';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import NotificationBadge from '@/components/ui/notification-badge';

interface NotificationBellProps {
  className?: string;
  onClick?: () => void;
}

const NotificationBell = ({ className = "", onClick }: NotificationBellProps) => {
  const { unreadCount } = useEnhancedNotifications();

  return (
    <div className={`relative cursor-pointer ${className}`} onClick={onClick}>
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <NotificationBadge 
          count={unreadCount} 
          className="absolute -top-2 -right-2" 
        />
      )}
    </div>
  );
};

export default NotificationBell;
