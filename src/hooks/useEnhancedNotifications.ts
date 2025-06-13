
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { NotificationData, NotificationSettings } from '@/types/messaging';

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

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const transformedData = (data || []).map(item => ({
        ...item,
        priority: item.priority || 'medium'
      }));

      setNotifications(transformedData);
      setUnreadCount(transformedData.filter(n => !n.is_read).length);
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
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  }, [user]);

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    if (!user) return;

    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          ...updatedSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

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
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

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
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

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
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: recipientId,
          type,
          title,
          message,
          priority,
          action_url: actionUrl,
          metadata,
          is_read: false
        })
        .select()
        .single();

      if (error) throw error;

      // Send push notification if enabled
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

      // Set up real-time subscription
      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newNotification = {
              ...payload.new,
              priority: payload.new.priority || 'medium'
            } as NotificationData;
            
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show toast for high priority notifications
            if (newNotification.priority === 'high' || newNotification.priority === 'urgent') {
              toast({
                title: newNotification.title,
                description: newNotification.message,
                variant: newNotification.priority === 'urgent' ? 'destructive' : 'default',
              });
            }

            // Send push notification
            if (settings.push_enabled && shouldSendNotification(newNotification.type)) {
              sendPushNotification(
                newNotification.title,
                newNotification.message,
                newNotification.action_url
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchNotifications, fetchSettings, toast, settings]);

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
