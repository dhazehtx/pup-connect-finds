
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, X, Settings, Trash2, Heart, MessageCircle, User, Star } from 'lucide-react';
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
        return <MessageCircle className="w-4 h-4 text-royal-blue" />;
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'follow':
        return <User className="w-4 h-4 text-mint-green" />;
      case 'review':
        return <Star className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-deep-navy" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="fixed top-16 right-4 w-96 max-h-[80vh] bg-cloud-white rounded-2xl shadow-2xl border border-soft-sky/20 overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-royal-blue to-mint-green p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Notifications</h2>
                {unreadCount > 0 && (
                  <p className="text-white/80 text-sm">{unreadCount} new updates</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          {unreadCount > 0 && (
            <div className="mt-4 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={markAllAsRead}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="px-6 pt-4 bg-cloud-white">
            <TabsList className="grid w-full grid-cols-2 bg-soft-sky/30">
              <TabsTrigger 
                value="all" 
                className="text-deep-navy data-[state=active]:bg-white data-[state=active]:text-royal-blue"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="unread" 
                className="text-deep-navy data-[state=active]:bg-white data-[state=active]:text-royal-blue"
              >
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content */}
          <div className="bg-cloud-white">
            <TabsContent value="all" className="mt-0">
              <ScrollArea className="h-[400px]">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-deep-navy/60 px-6">
                    <div className="p-4 bg-soft-sky/30 rounded-full mb-4">
                      <Bell className="h-8 w-8" />
                    </div>
                    <h3 className="font-medium mb-1">All caught up! 🎉</h3>
                    <p className="text-sm text-center">No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-xl transition-all duration-200 cursor-pointer hover:bg-soft-sky/20 group ${
                          !notification.is_read 
                            ? 'bg-royal-blue/5 border-l-4 border-l-royal-blue shadow-sm' 
                            : 'bg-white hover:shadow-sm'
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className={`text-sm font-medium text-deep-navy ${!notification.is_read ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0 text-deep-navy/40 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <p className="text-sm text-deep-navy/70 mb-2 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-deep-navy/50">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </span>
                              
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-royal-blue rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="unread" className="mt-0">
              <ScrollArea className="h-[400px]">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-deep-navy/60 px-6">
                    <div className="p-4 bg-mint-green/30 rounded-full mb-4">
                      <Check className="h-8 w-8 text-mint-green" />
                    </div>
                    <h3 className="font-medium mb-1">All caught up! 🎉</h3>
                    <p className="text-sm text-center">No unread notifications</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 rounded-xl bg-royal-blue/5 border-l-4 border-l-royal-blue shadow-sm hover:bg-royal-blue/10 transition-all duration-200 cursor-pointer group"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="text-sm font-semibold text-deep-navy">
                                {notification.title}
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0 text-deep-navy/40 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <p className="text-sm text-deep-navy/70 mb-2 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-deep-navy/50">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </span>
                              
                              <div className="w-2 h-2 bg-royal-blue rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="p-4 bg-cloud-white border-t border-soft-sky/20">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-deep-navy hover:bg-soft-sky/20 justify-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            Notification Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
