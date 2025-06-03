
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeData } from './useRealtimeData';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  related_id?: string;
  sender_id?: string;
  is_read: boolean;
  created_at: string;
  sender_profile?: {
    full_name: string;
    username: string;
    avatar_url: string;
  };
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Real-time updates for new notifications
  useRealtimeData({
    table: 'notifications',
    filter: user ? `user_id=eq.${user.id}` : undefined,
    onInsert: (payload) => {
      if (payload.new && payload.new.user_id === user?.id) {
        fetchNotifications(); // Refetch to get sender profile data
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification(payload.new.title, {
            body: payload.new.message,
            icon: '/favicon.ico'
          });
        }
      }
    },
    onUpdate: (payload) => {
      if (payload.new && payload.new.user_id === user?.id) {
        setNotifications(prev => prev.map(notification => 
          notification.id === payload.new.id 
            ? { ...notification, ...payload.new } 
            : notification
        ));
        updateUnreadCount();
      }
    }
  });

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender_profile:profiles!notifications_sender_id_fkey (
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedNotifications = data?.map(notification => ({
        ...notification,
        sender_profile: notification.sender_profile
      })) || [];

      setNotifications(formattedNotifications);
      updateUnreadCount(formattedNotifications);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUnreadCount = (notificationsList?: Notification[]) => {
    const list = notificationsList || notifications;
    const count = list.filter(n => !n.is_read).length;
    setUnreadCount(count);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setNotifications(prev => prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, is_read: true }
          : notification
      ));
      updateUnreadCount();
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
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

      setNotifications(prev => prev.map(notification => ({
        ...notification,
        is_read: true
      })));
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      updateUnreadCount();
    } catch (err: any) {
      console.error('Error deleting notification:', err);
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      requestNotificationPermission();
    }
  }, [user]);

  useEffect(() => {
    updateUnreadCount();
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications
  };
};
