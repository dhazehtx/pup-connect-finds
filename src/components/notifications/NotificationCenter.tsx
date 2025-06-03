
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Settings, MarkAsRead, Check, X, MessageCircle, Heart, Star, TrendingDown } from 'lucide-react';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { formatDistanceToNow } from 'date-fns';
import { getNotificationIcon, getTypeLabel } from '@/utils/notificationUtils';
import NotificationBadge from '@/components/ui/notification-badge';

const NotificationCenter = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useEnhancedNotifications();
  
  const {
    permission,
    isSupported,
    requestPermission,
    subscribeToNotifications
  } = usePushNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (permission === 'granted') {
      subscribeToNotifications();
    }
  }, [permission, subscribeToNotifications]);

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || !notification.is_read
  );

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    // Navigate to related content if available
    if (notification.related_id) {
      // Handle navigation based on notification type
      console.log('Navigate to:', notification.type, notification.related_id);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      await subscribeToNotifications();
    }
  };

  return (
    <div className="space-y-4">
      {/* Notification Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <NotificationBadge count={unreadCount} className="absolute -top-2 -right-2" />
                )}
              </div>
              Notifications
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} variant="outline" size="sm">
                  <Check className="h-4 w-4 mr-1" />
                  Mark All Read
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Push Notification Setup */}
          {isSupported && permission !== 'granted' && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">Enable Push Notifications</h4>
                  <p className="text-sm text-blue-700">
                    Get notified instantly about new messages and activity
                  </p>
                </div>
                <Button onClick={handleEnableNotifications} size="sm">
                  Enable
                </Button>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </Button>
          </div>

          {/* Notifications List */}
          <ScrollArea className="h-96">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-gray-500">
                  {filter === 'unread' ? 'All caught up!' : 'You have no notifications yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      notification.is_read 
                        ? 'bg-white hover:bg-gray-50' 
                        : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(notification.type)}
                            </Badge>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                            {notification.sender_profile && (
                              <>
                                <span>•</span>
                                <span>from {notification.sender_profile.full_name || notification.sender_profile.username}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">
              {notifications.filter(n => n.type === 'message').length}
            </div>
            <div className="text-sm text-gray-500">Messages</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold">
              {notifications.filter(n => n.type === 'favorite_update').length}
            </div>
            <div className="text-sm text-gray-500">Favorites</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">
              {notifications.filter(n => n.type === 'review').length}
            </div>
            <div className="text-sm text-gray-500">Reviews</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingDown className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">
              {notifications.filter(n => n.type === 'listing_interest').length}
            </div>
            <div className="text-sm text-gray-500">Interest</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationCenter;
