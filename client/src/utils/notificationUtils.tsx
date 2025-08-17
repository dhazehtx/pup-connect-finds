import React from 'react';
import { Bell, MessageCircle, Heart, User, Star } from 'lucide-react';

// Utility to generate notification URLs with deep linking
export const getNotificationUrl = (notification: any): string => {
  switch (notification.type) {
    case 'comment_reply':
      if (notification.post_id && notification.comment_id) {
        return `/posts/${notification.post_id}?comment=${notification.comment_id}`;
      }
      return notification.post_id ? `/posts/${notification.post_id}` : '/home';
    
    case 'like':
    case 'post_comment':
      return notification.post_id ? `/posts/${notification.post_id}` : '/home';
    
    case 'follow':
      return notification.from_user_id ? `/profile/${notification.from_user_id}` : '/home';
    
    case 'message':
      return '/messages';
    
    default:
      return '/home';
  }
};

// Utility to get notification icon based on type
export const getNotificationIcon = (type: string, className: string = 'w-4 h-4') => {
  switch (type) {
    case 'message':
      return <MessageCircle className={`${className} text-royal-blue`} />;
    case 'comment_reply':
      return <MessageCircle className={`${className} text-purple-500`} />;
    case 'like':
      return <Heart className={`${className} text-red-500`} />;
    case 'follow':
      return <User className={`${className} text-mint-green`} />;
    case 'review':
      return <Star className={`${className} text-blue-500`} />;
    default:
      return <Bell className={`${className} text-deep-navy`} />;
  }
};

// Utility to format notification content
export const formatNotificationContent = (notification: any): string => {
  const fromUser = notification.from_profile?.username || 
                   notification.from_profile?.full_name || 
                   'Someone';

  switch (notification.type) {
    case 'comment_reply':
      return `${fromUser} replied to your comment`;
    case 'like':
      return `${fromUser} liked your post`;
    case 'post_comment':
      return `${fromUser} commented on your post`;
    case 'follow':
      return `${fromUser} started following you`;
    case 'message':
      return `New message from ${fromUser}`;
    default:
      return notification.content || 'New notification';
  }
};

// Utility to scroll to and highlight a specific comment
export const scrollToComment = (commentId: string, delay: number = 100) => {
  setTimeout(() => {
    const commentElement = document.getElementById(`comment-${commentId}`);
    if (commentElement) {
      commentElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Add a temporary highlight class
      commentElement.classList.add('highlight-comment');
      setTimeout(() => {
        commentElement.classList.remove('highlight-comment');
      }, 3000);
    }
  }, delay);
};

// Utility to handle notification badge animations
export const triggerNotificationAnimation = (element: HTMLElement | null) => {
  if (!element) return;
  
  element.classList.add('notification-pulse');
  setTimeout(() => {
    element.classList.remove('notification-pulse');
  }, 1000);
};