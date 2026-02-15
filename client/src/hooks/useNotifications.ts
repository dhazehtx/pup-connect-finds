import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  type: string;
  toUserId: string;
  fromUserId: string;
  postId?: string | null;
  post_id?: string | null;
  commentId?: string | null;
  comment_id?: string | null;
  from_user_id?: string | null;
  message: string;
  isRead: boolean;
  is_read: boolean;
  createdAt: string;
  created_at: string;
  title?: string | null;
  from_profile?: {
    id: string | null;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
  actor?: {
    id: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      const data = await apiRequest('/api/notifications');

      setNotifications(data || []);
      setUnreadCount(data?.filter((n: any) => n.isRead === false || n.is_read === false).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      await apiRequest(`/api/notifications/${notificationId}/read`, { method: 'PATCH' });

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, isRead: true, is_read: true }
            : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiRequest('/api/notifications/mark-all-read', { method: 'PATCH' });

      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [user, fetchNotifications]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };
}
