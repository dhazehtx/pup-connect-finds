
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { X, MessageCircle, Heart, Star, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedNotificationToastProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    created_at: string;
    sender_profile?: {
      full_name?: string;
      username?: string;
    };
  };
  onClose: () => void;
  onAction: () => void;
  autoHideDuration?: number;
}

const EnhancedNotificationToast = ({
  notification,
  onClose,
  onAction,
  autoHideDuration = 5000
}: EnhancedNotificationToastProps) => {
  useEffect(() => {
    if (autoHideDuration > 0) {
      const timer = setTimeout(onClose, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case 'message':
        return <MessageCircle className="w-4 h-4" />;
      case 'like':
        return <Heart className="w-4 h-4" />;
      case 'review':
        return <Star className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getActionText = () => {
    switch (notification.type) {
      case 'message':
        return 'View Message';
      case 'like':
        return 'View Profile';
      case 'review':
        return 'View Review';
      default:
        return 'View';
    }
  };

  return (
    <Card className="w-80 shadow-lg border-l-4 border-l-primary animate-in slide-in-from-right">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm truncate">
                {notification.title}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0 hover:bg-muted"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </span>
              
              <Button
                variant="default"
                size="sm"
                onClick={onAction}
                className="h-7 px-3 text-xs"
              >
                {getActionText()}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedNotificationToast;
