
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, X, Settings, Trash2 } from 'lucide-react';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter = ({ isOpen, onClose }: NotificationCenterProps) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useEnhancedNotifications();
  const [activeTab, setActiveTab] = useState('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') return !notification.is_read;
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
      case 'like':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case 'follow':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onClose}>
      <div className="fixed top-16 right-4 w-96 max-h-[80vh] bg-white rounded-lg shadow-xl border" onClick={(e) => e.stopPropagation()}>
        <Card className="h-full">
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Bell className="h-5 w-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="px-4 pt-2 bg-gray-50">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all" className="text-gray-700">All</TabsTrigger>
                <TabsTrigger value="unread" className="text-gray-700">
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="p-0 h-full">
              <TabsContent value="all" className="mt-0 h-full">
                <ScrollArea className="h-[400px]">
                  {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                      <Bell className="h-8 w-8 mb-2 text-gray-400" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                            !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'bg-white'
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <h4 className={`text-sm font-medium text-gray-900 ${!notification.is_read ? 'font-semibold' : ''}`}>
                                  {notification.title}
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="unread" className="mt-0 h-full">
                <ScrollArea className="h-[400px]">
                  {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                      <Check className="h-8 w-8 mb-2 text-green-500" />
                      <p>All caught up!</p>
                      <p className="text-xs">No unread notifications</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-4 border-b bg-blue-50 border-l-4 border-l-blue-500 hover:bg-blue-100 cursor-pointer"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <h4 className="text-sm font-semibold text-gray-900">
                                  {notification.title}
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </CardContent>
          </Tabs>

          <div className="p-3 border-t bg-gray-50">
            <Button variant="ghost" size="sm" className="w-full text-gray-600 hover:text-gray-700">
              <Settings className="h-4 w-4 mr-2" />
              Notification Settings
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NotificationCenter;
