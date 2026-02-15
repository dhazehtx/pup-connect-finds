
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';

export const useRealtimeNotifications = () => {
  const { user } = useAuth();

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
        } as any
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
        } as any
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
        } as any
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
        } as any
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
