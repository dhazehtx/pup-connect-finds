
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { NotificationData, NotificationSettings } from '@/types/messaging';
import { useSocket } from '@/hooks/useSocket';

export const useEnhancedNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    push_enabled: true,
    email_enabled: true,
    sms_enabled: false,
    message_notifications: true,
    payment_notifications: true,
    security_notifications: true,
    marketing_notifications: false,
    notification_frequency: 'immediate',
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { connected, onEvent } = useSocket();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const data = await apiRequest('/api/notifications');

      const transformedData = (data || []).map((item: any) => ({
        ...item,
        user_id: item.toUserId || item.user_id,
        is_read: item.isRead ?? item.is_read ?? false,
        created_at: item.createdAt || item.created_at,
        priority: 'medium' as const,
        type: item.type as NotificationData['type']
      }));

      setNotifications(transformedData);
      setUnreadCount(transformedData.filter((n: NotificationData) => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error loading notifications",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const fetchSettings = useCallback(async () => {
    if (!user) return;

    try {
      const data = await apiRequest(`/api/user/preferences?user_id=${user.id}`);
      
      if (data && data.matching_criteria) {
        const criteria = data.matching_criteria as any;
        if (criteria.notification_settings) {
          setSettings(prev => ({ ...prev, ...criteria.notification_settings }));
        }
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  }, [user]);

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    if (!user) return;

    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      await apiRequest('/api/user/preferences', {
        method: 'POST',
        body: {
          user_id: user.id,
          matching_criteria: {
            notification_settings: updatedSettings
          } as any,
          updated_at: new Date().toISOString()
        }
      });

      setSettings(updatedSettings);
      
      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error updating settings",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiRequest(`/api/notifications/${notificationId}/read`, { method: 'PATCH' });

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await apiRequest('/api/notifications/mark-all-read', { method: 'PATCH' });

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.is_read ? prev - 1 : prev;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const createNotification = async (
    recipientId: string,
    type: NotificationData['type'],
    title: string,
    message: string,
    priority: NotificationData['priority'] = 'medium',
    actionUrl?: string,
    metadata?: any
  ) => {
    try {
      const data = await apiRequest('/api/notifications', {
        method: 'POST',
        body: {
          toUserId: recipientId,
          type,
          title,
          message,
          fromUserId: user?.id,
          relatedId: metadata?.listingId || metadata?.conversationId
        }
      });

      if (settings.push_enabled && shouldSendNotification(type)) {
        await sendPushNotification(title, message, actionUrl);
      }

      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  const shouldSendNotification = (type: NotificationData['type']): boolean => {
    switch (type) {
      case 'message': return settings.message_notifications;
      case 'payment': return settings.payment_notifications;
      case 'security': return settings.security_notifications;
      case 'marketing': return settings.marketing_notifications;
      default: return true;
    }
  };

  const sendPushNotification = async (title: string, body: string, url?: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'app-notification'
      });

      if (url) {
        notification.onclick = () => {
          window.focus();
          window.location.href = url;
          notification.close();
        };
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchSettings();
    }
  }, [user, fetchNotifications, fetchSettings]);

  useEffect(() => {
    if (!connected || !user) return;

    const cleanup = onEvent('notification:new', (payload: any) => {
      const newNotification = {
        ...payload,
        priority: 'medium' as const,
        type: payload.type as NotificationData['type']
      } as NotificationData;
      
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      if (newNotification.priority === 'high' || newNotification.priority === 'urgent') {
        toast({
          title: newNotification.title,
          description: newNotification.message,
          variant: newNotification.priority === 'urgent' ? 'destructive' : 'default',
        });
      }

      if (settings.push_enabled && shouldSendNotification(newNotification.type)) {
        sendPushNotification(
          newNotification.title,
          newNotification.message,
          (newNotification as any).target_url
        );
      }
    });

    return () => {
      cleanup?.();
    };
  }, [connected, user, onEvent, toast, settings]);

  return {
    notifications,
    settings,
    unreadCount,
    loading,
    fetchNotifications,
    updateSettings,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    requestNotificationPermission
  };
};
