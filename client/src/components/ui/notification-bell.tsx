
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
    <div 
      className={`relative cursor-pointer text-deep-navy hover:text-royal-blue transition-colors duration-200 ${className}`} 
      onClick={onClick}
    >
      <div className="p-2 hover:bg-soft-sky/20 rounded-full transition-colors duration-200">
        <Bell className="h-6 w-6" />
      </div>
      {unreadCount > 0 && (
        <NotificationBadge 
          count={unreadCount} 
          className="absolute -top-1 -right-1 bg-royal-blue text-white border-2 border-white shadow-sm" 
        />
      )}
    </div>
  );
};

export default NotificationBell;
