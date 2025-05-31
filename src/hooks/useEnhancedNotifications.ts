
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
    avatar_url?: string;
  };
}

export const useEnhancedNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
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

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
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

  // Create notification
  const createNotification = useCallback(async (
    userId: string,
    type: string,
    title: string,
    message: string,
    relatedId?: string,
    senderId?: string
  ) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          type,
          title,
          message,
          related_id: relatedId,
          sender_id: senderId
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
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
      console.error('Error marking all as read:', error);
    }
  }, [user]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId);
        const newNotifications = prev.filter(n => n.id !== notificationId);
        
        if (notification && !notification.is_read) {
          setUnreadCount(prevCount => Math.max(0, prevCount - 1));
        }
        
        return newNotifications;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  // Notification helpers for common events
  const notifyNewMessage = useCallback(async (recipientId: string, senderName: string, message: string) => {
    await createNotification(
      recipientId,
      'message',
      'New Message',
      `${senderName}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
      undefined,
      user?.id
    );
  }, [createNotification, user]);

  const notifyListingInterest = useCallback(async (sellerId: string, listingId: string, buyerName: string) => {
    await createNotification(
      sellerId,
      'listing_interest',
      'New Interest in Your Listing',
      `${buyerName} is interested in your listing`,
      listingId,
      user?.id
    );
  }, [createNotification, user]);

  const notifyNewReview = useCallback(async (userId: string, reviewerName: string, rating: number) => {
    await createNotification(
      userId,
      'review',
      'New Review',
      `${reviewerName} left you a ${rating}-star review`,
      undefined,
      user?.id
    );
  }, [createNotification, user]);

  const notifyFavoriteUpdate = useCallback(async (userId: string, listingName: string, updateType: string) => {
    await createNotification(
      userId,
      'favorite_update',
      'Favorite Listing Updated',
      `${listingName} has been ${updateType}`,
      undefined
    );
  }, [createNotification]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast for new notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  // Load notifications on mount
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    // Helper functions for creating specific notification types
    notifyNewMessage,
    notifyListingInterest,
    notifyNewReview,
    notifyFavoriteUpdate
  };
};
