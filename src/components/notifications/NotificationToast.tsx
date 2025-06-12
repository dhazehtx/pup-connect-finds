
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, X, MessageCircle, Heart, Star, DollarSign, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationToastProps {
  notification: any;
  onClose: () => void;
  onAction: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onAction
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'message': 
        return <MessageCircle className="w-5 h-5 text-royal-blue" />;
      case 'like': 
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'review': 
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'payment_confirmation': 
        return <DollarSign className="w-5 h-5 text-mint-green" />;
      case 'follow':
        return <User className="w-5 h-5 text-royal-blue" />;
      default: 
        return <Bell className="w-5 h-5 text-deep-navy" />;
    }
  };

  const getGradientClass = () => {
    switch (notification.type) {
      case 'message': return 'from-royal-blue/10 to-soft-sky/20 border-royal-blue/20';
      case 'like': return 'from-red-50 to-red-100 border-red-200';
      case 'review': return 'from-yellow-50 to-yellow-100 border-yellow-200';
      case 'payment_confirmation': return 'from-mint-green/10 to-mint-green/20 border-mint-green/30';
      case 'follow': return 'from-royal-blue/10 to-soft-sky/20 border-royal-blue/20';
      default: return 'from-cloud-white to-soft-sky/10 border-soft-sky/20';
    }
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <Card className={`w-80 shadow-xl bg-gradient-to-br ${getGradientClass()} backdrop-blur-sm border-l-4`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5 p-2 bg-white/80 rounded-full shadow-sm">
              {getIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-sm text-deep-navy line-clamp-1">
                  {notification.title}
                </h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClose}
                  className="h-6 w-6 p-0 text-deep-navy/60 hover:text-deep-navy hover:bg-white/60"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              
              <p className="text-sm text-deep-navy/80 mb-3 line-clamp-2">
                {notification.message}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-deep-navy/60">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </span>
                
                <Button
                  size="sm"
                  onClick={onAction}
                  className="h-7 px-3 text-xs bg-royal-blue hover:bg-royal-blue/90 text-white shadow-sm"
                >
                  View
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationToast;
