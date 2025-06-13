
import React from 'react';
import { MessageCircle, DollarSign, Shield, Star, Heart, UserPlus } from 'lucide-react';

export const getNotificationTemplate = (type: string, data: any) => {
  switch (type) {
    case 'new_message':
      return {
        title: 'New Message',
        message: `${data.senderName} sent you a message`,
        icon: MessageCircle,
        priority: 'medium' as const,
        action_url: `/messages?conversation=${data.conversationId}`
      };

    case 'payment_received':
      return {
        title: 'Payment Received',
        message: `You received $${data.amount} from ${data.senderName}`,
        icon: DollarSign,
        priority: 'high' as const,
        action_url: `/transactions/${data.transactionId}`
      };

    case 'payment_sent':
      return {
        title: 'Payment Sent',
        message: `Payment of $${data.amount} sent to ${data.recipientName}`,
        icon: DollarSign,
        priority: 'medium' as const,
        action_url: `/transactions/${data.transactionId}`
      };

    case 'security_alert':
      return {
        title: 'Security Alert',
        message: data.message || 'Suspicious activity detected on your account',
        icon: Shield,
        priority: 'urgent' as const,
        action_url: '/settings/security'
      };

    case 'listing_favorite':
      return {
        title: 'Listing Favorited',
        message: `${data.userName} added your ${data.listingName} to their favorites`,
        icon: Heart,
        priority: 'low' as const,
        action_url: `/listings/${data.listingId}`
      };

    case 'new_review':
      return {
        title: 'New Review',
        message: `${data.reviewerName} left you a ${data.rating}-star review`,
        icon: Star,
        priority: 'medium' as const,
        action_url: `/profile/reviews`
      };

    case 'new_follower':
      return {
        title: 'New Follower',
        message: `${data.followerName} started following you`,
        icon: UserPlus,
        priority: 'low' as const,
        action_url: `/profile/${data.followerId}`
      };

    case 'listing_interest':
      return {
        title: 'Interest in Your Listing',
        message: `${data.userName} is interested in your ${data.listingName}`,
        icon: MessageCircle,
        priority: 'medium' as const,
        action_url: `/listings/${data.listingId}/inquiries`
      };

    case 'price_drop_alert':
      return {
        title: 'Price Drop Alert',
        message: `${data.listingName} price dropped to $${data.newPrice} (was $${data.oldPrice})`,
        icon: DollarSign,
        priority: 'medium' as const,
        action_url: `/listings/${data.listingId}`
      };

    default:
      return {
        title: 'Notification',
        message: data.message || 'You have a new notification',
        icon: MessageCircle,
        priority: 'low' as const
      };
  }
};

export const formatNotificationForDisplay = (notification: any) => {
  const template = getNotificationTemplate(notification.type, notification.metadata || {});
  
  return {
    ...notification,
    ...template,
    formattedTime: new Date(notification.created_at).toLocaleString()
  };
};
