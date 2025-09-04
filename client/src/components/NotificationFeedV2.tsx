import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck, User, Heart, MessageCircle, Shield, Bell } from 'lucide-react';
import { useAuthState } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  isRead: boolean;
  createdAt: string;
  targetUrl?: string;
  meta?: {
    actors?: string[];
    [key: string]: any;
  };
}

interface NotificationFeedProps {
  onMarkAsRead?: (notificationId: string) => void;
  onClose?: () => void;
}

export function NotificationFeedV2({ onMarkAsRead, onClose }: NotificationFeedProps) {
  const { user } = useAuthState();
  const queryClient = useQueryClient();
  const [cursor, setCursor] = useState<string | undefined>();
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['/api/notifications-v2', user?.id, cursor],
    enabled: !!user?.id,
    refetchInterval: user?.id ? 30000 : false, // Only refetch if user is authenticated
    retry: false, // Don't retry failed requests to reduce console spam
  });

  const notifications = (notificationsData as any)?.notifications || [];
  const hasMore = (notificationsData as any)?.hasMore || false;

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest('/api/notifications-v2/mark-read', {
        method: 'POST',
        body: JSON.stringify({ id: notificationId }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (_, notificationId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications-v2'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications-v2?count=1'] });
      onMarkAsRead?.(notificationId);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('/api/notifications-v2/mark-read', {
        method: 'POST',
        body: JSON.stringify({ all: true }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications-v2'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications-v2?count=1'] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  });

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.read && !notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate to target URL if available
    if (notification.targetUrl) {
      window.location.href = notification.targetUrl;
      onClose?.();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'follow':
        return <User className="h-4 w-4 text-green-500" />;
      case 'provider_app_submitted':
        return <Shield className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatNotificationTime = (createdAt: string) => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  if (!user) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>Sign in to view notifications</p>
      </div>
    );
  }

  const hasUnreadNotifications = notifications.some((n: Notification) => !n.read && !n.isRead);

  return (
    <div className="w-full max-h-96">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {hasUnreadNotifications && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              data-testid="mark-all-read-button"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <ScrollArea className="max-h-80">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No notifications yet</p>
            <p className="text-xs mt-1">We'll notify you when something happens</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification: Notification, index: number) => {
              const isUnread = !notification.read && !notification.isRead;
              
              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    isUnread ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                  data-testid={`notification-item-${index}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${isUnread ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          {formatNotificationTime(notification.createdAt)}
                        </p>
                        
                        <div className="flex items-center space-x-2">
                          {isUnread && (
                            <Badge variant="default" className="bg-blue-500 text-white px-2 py-0.5 text-xs">
                              New
                            </Badge>
                          )}
                          
                          {!isUnread && (
                            <Check className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Separator />
          <div className="p-3 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700"
              onClick={() => {
                window.location.href = '/notifications';
                onClose?.();
              }}
              data-testid="view-all-notifications"
            >
              View all notifications
            </Button>
          </div>
        </>
      )}
    </div>
  );
}