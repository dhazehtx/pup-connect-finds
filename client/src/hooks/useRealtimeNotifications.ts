
import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/hooks/useSocket';
import { apiRequest } from '@/lib/api';

export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const { fetchNotifications } = useEnhancedNotifications();
  const { sendNotification, permission } = usePushNotifications();
  const { toast } = useToast();
  const { connected, onEvent } = useSocket();

  const handleNewNotification = useCallback((payload: any) => {
    toast({
      title: payload.title || 'New notification',
      description: payload.message,
    });

    if (permission === 'granted') {
      sendNotification(payload.title || 'New notification', {
        body: payload.message,
        tag: payload.type,
        requireInteraction: ['payment_confirmation', 'security_alert'].includes(payload.type),
      });
    }

    fetchNotifications();
  }, [toast, permission, sendNotification, fetchNotifications]);

  useEffect(() => {
    if (!user || !connected) return;

    const cleanup = onEvent('notification:new', handleNewNotification);

    return () => {
      cleanup?.();
    };
  }, [user, connected, onEvent, handleNewNotification]);

  const triggerMessageNotification = useCallback(async (recipientId: string, senderName: string, message: string) => {
    try {
      await apiRequest('/api/notifications', {
        method: 'POST',
        body: {
          toUserId: recipientId,
          type: 'message',
          title: 'New Message',
          message: `${senderName}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
          fromUserId: user?.id
        }
      });
    } catch (error) {
      console.error('Error creating message notification:', error);
    }
  }, [user]);

  const triggerListingInterestNotification = useCallback(async (sellerId: string, listingId: string, buyerName: string) => {
    try {
      await apiRequest('/api/notifications', {
        method: 'POST',
        body: {
          toUserId: sellerId,
          type: 'listing_interest',
          title: 'New Interest in Your Listing',
          message: `${buyerName} is interested in your listing`,
          relatedId: listingId,
          fromUserId: user?.id
        }
      });
    } catch (error) {
      console.error('Error creating listing interest notification:', error);
    }
  }, [user]);

  const triggerReviewNotification = useCallback(async (userId: string, reviewerName: string, rating: number) => {
    try {
      await apiRequest('/api/notifications', {
        method: 'POST',
        body: {
          toUserId: userId,
          type: 'review',
          title: 'New Review',
          message: `${reviewerName} left you a ${rating}-star review`,
          fromUserId: user?.id
        }
      });
    } catch (error) {
      console.error('Error creating review notification:', error);
    }
  }, [user]);

  const triggerFavoriteUpdateNotification = useCallback(async (userId: string, listingName: string, updateType: string) => {
    try {
      await apiRequest('/api/notifications', {
        method: 'POST',
        body: {
          toUserId: userId,
          type: 'favorite_update',
          title: 'Favorite Listing Updated',
          message: `${listingName} has been ${updateType}`
        }
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
