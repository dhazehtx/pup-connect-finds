
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';

export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const { fetchNotifications } = useEnhancedNotifications();
  const { sendNotification, permission } = usePushNotifications();
  const { toast } = useToast();

  const handleNewNotification = useCallback((payload: any) => {
    const notification = payload.new;
    
    toast({
      title: notification.title,
      description: notification.message,
    });

    if (permission === 'granted') {
      sendNotification(notification.title, {
        body: notification.message,
        tag: notification.type,
        requireInteraction: ['payment_confirmation', 'security_alert'].includes(notification.type),
      });
    }

    fetchNotifications();
  }, [toast, permission, sendNotification, fetchNotifications]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `to_user_id=eq.${user.id}`
        },
        handleNewNotification
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, handleNewNotification]);

  const triggerMessageNotification = useCallback(async (recipientId: string, senderName: string, message: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUserId: recipientId,
          type: 'message',
          title: 'New Message',
          message: `${senderName}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
          fromUserId: user?.id
        })
      });
    } catch (error) {
      console.error('Error creating message notification:', error);
    }
  }, [user]);

  const triggerListingInterestNotification = useCallback(async (sellerId: string, listingId: string, buyerName: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUserId: sellerId,
          type: 'listing_interest',
          title: 'New Interest in Your Listing',
          message: `${buyerName} is interested in your listing`,
          relatedId: listingId,
          fromUserId: user?.id
        })
      });
    } catch (error) {
      console.error('Error creating listing interest notification:', error);
    }
  }, [user]);

  const triggerReviewNotification = useCallback(async (userId: string, reviewerName: string, rating: number) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUserId: userId,
          type: 'review',
          title: 'New Review',
          message: `${reviewerName} left you a ${rating}-star review`,
          fromUserId: user?.id
        })
      });
    } catch (error) {
      console.error('Error creating review notification:', error);
    }
  }, [user]);

  const triggerFavoriteUpdateNotification = useCallback(async (userId: string, listingName: string, updateType: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUserId: userId,
          type: 'favorite_update',
          title: 'Favorite Listing Updated',
          message: `${listingName} has been ${updateType}`
        })
      });
    } catch (error) {
      console.error('Error creating favorite update notification:', error);
    }
  }, []);

  return {
    triggerMessageNotification,
    triggerListingInterestNotification,
    triggerReviewNotification,
    triggerFavoriteUpdateNotification
  };
};
