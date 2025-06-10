
import React, { useEffect } from 'react';
import { Bell, X, MessageCircle, Heart, Star, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { getNotificationIcon } from '@/utils/notificationUtils';

interface NotificationToastProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    created_at: string;
    sender_profile?: {
      full_name?: string;
      username?: string;
      avatar_url?: string;
    };
  };
  onClose: () => void;
  onAction?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const NotificationToast = ({
  notification,
  onClose,
  onAction,
  autoClose = true,
  duration = 5000
}: NotificationToastProps) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getActionText = (type: string) => {
    switch (type) {
      case 'message':
        return 'Reply';
      case 'like':
        return 'View';
      case 'follow':
        return 'View Profile';
      case 'review':
        return 'View Review';
      default:
        return 'View';
    }
  };

  const shouldShowAction = ['message', 'like', 'follow', 'review'].includes(notification.type);

  return (
    <Card className="w-80 shadow-lg border-l-4 border-l-primary animate-in slide-in-from-right duration-300">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getNotificationIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium text-sm truncate">
                {notification.title}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0 ml-2"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {notification.message}
            </p>
            
            {notification.sender_profile && (
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={notification.sender_profile.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {notification.sender_profile.full_name?.charAt(0) || 
                     notification.sender_profile.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {notification.sender_profile.full_name || notification.sender_profile.username}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </span>
              
              {shouldShowAction && onAction && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAction}
                  className="text-xs h-6"
                >
                  {getActionText(notification.type)}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NotificationToast;
