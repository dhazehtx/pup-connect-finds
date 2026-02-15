import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthState as useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, UserPlus, ShoppingBag, FileText, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  actor?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  meta?: Record<string, any>;
}

interface NotificationFeedProps {
  onNotificationRead?: () => void;
  onClose?: () => void;
}

const notificationIcons = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  message: MessageCircle,
  order_paid: ShoppingBag,
  provider_app_submitted: FileText,
  provider_app_approved: CheckCircle,
  provider_app_rejected: X,
} as const;

const notificationColors = {
  like: 'text-red-500',
  comment: 'text-blue-500',
  follow: 'text-green-500',
  message: 'text-blue-500',
  order_paid: 'text-purple-500',
  provider_app_submitted: 'text-orange-500',
  provider_app_approved: 'text-green-500',
  provider_app_rejected: 'text-red-500',
} as const;

export function NotificationFeed({ onNotificationRead, onClose }: NotificationFeedProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['/api/notifications', user?.id, filter],
    enabled: !!user?.id,
  });

  const notifications: Notification[] = Array.isArray(notificationsData) ? notificationsData : (notificationsData as any)?.notifications || [];

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest(`/api/notifications/${notificationId}/read`, { method: 'PATCH' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      onNotificationRead?.();
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/notifications/mark-all-read', { method: 'PATCH' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      onNotificationRead?.();
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    // TODO: Navigate to relevant page based on notification type
    onClose?.();
  };

  const getNotificationIcon = (type: string) => {
    const IconComponent = notificationIcons[type as keyof typeof notificationIcons] || FileText;
    const colorClass = notificationColors[type as keyof typeof notificationColors] || 'text-gray-500';
    return <IconComponent className={`h-4 w-4 ${colorClass}`} />;
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  if (!user) return null;

  return (
    <div className="w-full" data-testid="notification-feed">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {notifications.some(n => !n.is_read) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              data-testid="mark-all-read-button"
            >
              Mark all read
            </Button>
          )}
        </div>
        
        {/* Filter tabs */}
        <div className="flex space-x-1">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
            data-testid="filter-all-button"
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('unread')}
            data-testid="filter-unread-button"
          >
            Unread
            {notifications.filter(n => !n.is_read).length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                {notifications.filter(n => !n.is_read).length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Notifications list */}
      <ScrollArea className="h-96">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
          </div>
        ) : (
          <div className="divide-y">
            {filteredNotifications.map((notification, index) => (
              <div key={notification.id}>
                <div
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                  data-testid={`notification-item-${notification.id}`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Actor avatar or icon */}
                    <div className="flex-shrink-0">
                      {notification.actor?.avatar_url ? (
                        <img
                          src={notification.actor.avatar_url}
                          alt={notification.actor.full_name || 'User'}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        {notification.actor?.full_name && (
                          <span className="font-medium">{notification.actor.full_name} </span>
                        )}
                        <span className={!notification.is_read ? 'font-medium' : ''}>
                          {notification.message}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                </div>
                {index < filteredNotifications.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}