
import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Load saved notifications from localStorage
    const saved = localStorage.getItem('notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(parsed);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save notifications to localStorage
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show browser notification if permission granted
    if (permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }

    return newNotification;
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Predefined notification types for common scenarios
  const notifyNewMatch = (breedName: string, location: string) => {
    addNotification({
      title: 'New Match Found! 🐕',
      message: `A ${breedName} is now available in ${location}`,
      type: 'info',
      actionUrl: '/explore'
    });
  };

  const notifyPriceReduction = (petName: string, newPrice: string) => {
    addNotification({
      title: 'Price Drop! 💰',
      message: `${petName} is now available for ${newPrice}`,
      type: 'success'
    });
  };

  const notifyNewMessage = (senderName: string) => {
    addNotification({
      title: 'New Message 💬',
      message: `${senderName} sent you a message`,
      type: 'info',
      actionUrl: '/messages'
    });
  };

  const notifyScheduledReminder = (eventType: string, petName: string) => {
    addNotification({
      title: 'Reminder 🔔',
      message: `${eventType} scheduled for ${petName}`,
      type: 'warning'
    });
  };

  return {
    notifications,
    unreadCount,
    permission,
    requestPermission,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    // Predefined notifications
    notifyNewMatch,
    notifyPriceReduction,
    notifyNewMessage,
    notifyScheduledReminder
  };
};
