
import React from 'react';
import { Heart, MessageCircle, UserPlus, Star, Bell, TrendingDown, Search, FileCheck } from 'lucide-react';

export const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'like':
      return <Heart size={16} className="text-red-500" />;
    case 'comment':
      return <MessageCircle size={16} className="text-blue-500" />;
    case 'message':
      return <MessageCircle size={16} className="text-blue-500" />;
    case 'follow':
      return <UserPlus size={16} className="text-green-500" />;
    case 'review':
      return <Star size={16} className="text-amber-500" />;
    case 'price_drop':
      return <TrendingDown size={16} className="text-orange-500" />;
    case 'new_listing':
      return <Search size={16} className="text-purple-500" />;
    case 'application':
      return <FileCheck size={16} className="text-green-600" />;
    default:
      return <Bell size={16} className="text-gray-500" />;
  }
};

export const getTypeLabel = (type: string) => {
  switch (type) {
    case 'like': return 'Like';
    case 'comment': return 'Comment';
    case 'price_drop': return 'Price Alert';
    case 'new_listing': return 'New Match';
    case 'application': return 'Application';
    case 'message': return 'Message';
    case 'follow': return 'Follow';
    case 'review': return 'Review';
    default: return 'Notification';
  }
};
