
import React from 'react';
import { Bell, MessageCircle, Heart, Star, DollarSign, Shield, AlertTriangle, User } from 'lucide-react';

export const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'message':
      return <MessageCircle className="w-4 h-4 text-blue-500" />;
    case 'like':
    case 'favorite':
      return <Heart className="w-4 h-4 text-red-500" />;
    case 'review':
      return <Star className="w-4 h-4 text-yellow-500" />;
    case 'payment_confirmation':
    case 'payment':
      return <DollarSign className="w-4 h-4 text-green-500" />;
    case 'security_alert':
      return <Shield className="w-4 h-4 text-red-600" />;
    case 'follow':
      return <User className="w-4 h-4 text-purple-500" />;
    case 'listing_interest':
      return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

export const getTypeLabel = (type: string): string => {
  switch (type) {
    case 'message': return 'Message';
    case 'like': return 'Like';
    case 'favorite': return 'Favorite';
    case 'review': return 'Review';
    case 'payment_confirmation': return 'Payment';
    case 'payment': return 'Payment';
    case 'security_alert': return 'Security';
    case 'follow': return 'Follow';
    case 'listing_interest': return 'Interest';
    default: return 'Notification';
  }
};

export const getNotificationColor = (type: string): string => {
  switch (type) {
    case 'message': return 'bg-blue-50 border-blue-200';
    case 'like':
    case 'favorite': return 'bg-red-50 border-red-200';
    case 'review': return 'bg-yellow-50 border-yellow-200';
    case 'payment_confirmation':
    case 'payment': return 'bg-green-50 border-green-200';
    case 'security_alert': return 'bg-red-50 border-red-300';
    case 'follow': return 'bg-purple-50 border-purple-200';
    case 'listing_interest': return 'bg-orange-50 border-orange-200';
    default: return 'bg-gray-50 border-gray-200';
  }
};

export const shouldSendPushNotification = (type: string, userSettings: any): boolean => {
  if (!userSettings?.push_enabled) return false;
  
  switch (type) {
    case 'message': return userSettings.push_messages;
    case 'like': return userSettings.push_likes;
    case 'comment': return userSettings.push_comments;
    case 'follow': return userSettings.push_follows;
    case 'payment_confirmation': return userSettings.push_payments;
    default: return true;
  }
};

export const shouldSendEmailNotification = (type: string, userSettings: any): boolean => {
  if (!userSettings?.email_enabled) return false;
  
  switch (type) {
    case 'message': return userSettings.email_messages;
    case 'security_alert': return userSettings.email_security;
    case 'payment_confirmation': return true; // Always send payment confirmations
    default: return false;
  }
};

export const shouldSendSMSNotification = (type: string, userSettings: any): boolean => {
  if (!userSettings?.sms_enabled) return false;
  
  if (userSettings.sms_critical_only) {
    return ['payment_confirmation', 'security_alert'].includes(type);
  }
  
  switch (type) {
    case 'payment_confirmation': return userSettings.sms_payments;
    case 'security_alert': return userSettings.sms_security;
    default: return false;
  }
};
