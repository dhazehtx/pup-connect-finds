import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/hooks/useSocket';

interface Notification {
  id: string;
  type: string;
  toUserId: string;
  fromUserId: string;
  postId?: string | null;
  commentId?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
  title?: string | null;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const { connected, onEvent } = useSocket();

  const fetchNotifications = useCallback(async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      const data = await apiRequest('/api/notifications');

      setNotifications(data || []);
      setUnreadCount(data?.filter((n: any) => !n.isRead).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const markAsRead = async (notificationId: string) => {
    try {
      await apiRequest(`/api/notifications/${notificationId}/read`, { method: 'PATCH' });

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, isRead: true }
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
        prev.map(n => ({ ...n, isRead: true }))
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
    if (!connected) return;

    const cleanup = onEvent('notification:new', () => {
      fetchNotifications();
    });

    return () => {
      cleanup?.();
    };
  }, [connected, onEvent, fetchNotifications]);

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };
}
