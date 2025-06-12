
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NotificationCenter from './NotificationCenter';
import NotificationToast from './NotificationToast';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

interface ToastNotification {
  id: string;
  notification: any;
  timestamp: number;
}

const NotificationManager = () => {
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [toastNotifications, setToastNotifications] = useState<ToastNotification[]>([]);
  
  const { notifications, unreadCount } = useEnhancedNotifications();
  const { permission, requestPermission } = usePushNotifications();
  const { 
    triggerMessageNotification,
    triggerListingInterestNotification,
    triggerReviewNotification 
  } = useRealtimeNotifications();

  // Show toast for new notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      const now = Date.now();
      
      // Only show toast for notifications created in the last 10 seconds
      const notificationAge = now - new Date(latestNotification.created_at).getTime();
      if (notificationAge < 10000 && !latestNotification.is_read) {
        const toastId = `toast-${latestNotification.id}-${now}`;
        
        // Check if we already have a toast for this notification
        const existingToast = toastNotifications.find(
          toast => toast.notification.id === latestNotification.id
        );
        
        if (!existingToast) {
          setToastNotifications(prev => [
            ...prev,
            {
              id: toastId,
              notification: latestNotification,
              timestamp: now
            }
          ]);
        }
      }
    }
  }, [notifications, toastNotifications]);

  const handleToastClose = (toastId: string) => {
    setToastNotifications(prev => prev.filter(toast => toast.id !== toastId));
  };

  const handleToastAction = (notification: any) => {
    // Handle notification action based on type
    switch (notification.type) {
      case 'message':
        // Navigate to messages
        console.log('Navigate to messages');
        break;
      case 'like':
      case 'follow':
        // Navigate to profile
        console.log('Navigate to profile');
        break;
      case 'review':
        // Navigate to reviews
        console.log('Navigate to reviews');
        break;
      default:
        console.log('Default notification action');
    }
    
    // Close the toast
    const toast = toastNotifications.find(t => t.notification.id === notification.id);
    if (toast) {
      handleToastClose(toast.id);
    }
  };

  const handleBellClick = () => {
    if (permission === 'default') {
      requestPermission();
    }
    setIsNotificationCenterOpen(!isNotificationCenterOpen);
  };

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBellClick}
          className="relative text-gray-700 hover:text-blue-600 hover:bg-gray-100"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toastNotifications.map((toast) => (
          <NotificationToast
            key={toast.id}
            notification={toast.notification}
            onClose={() => handleToastClose(toast.id)}
            onAction={() => handleToastAction(toast.notification)}
          />
        ))}
      </div>
    </>
  );
};

export default NotificationManager;
