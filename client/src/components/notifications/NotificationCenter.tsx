
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, X, Settings, Trash2, Heart, MessageCircle, User, Star, CheckCheck } from 'lucide-react';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import ReplyNotificationItem from './ReplyNotificationItem';
import { useNavigate } from 'react-router-dom';
import { getNotificationUrl, getNotificationIcon, formatNotificationContent } from '@/utils/notificationUtils';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter = ({ isOpen, onClose }: NotificationCenterProps) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Handle loading or error states
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" onClick={onClose}>
        <div className="fixed top-16 right-4 w-96 max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden p-6">
          <div className="text-center">Loading notifications...</div>
        </div>
      </div>
    );
  }

  if (!notifications) {
    return (
      <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" onClick={onClose}>
        <div className="fixed top-16 right-4 w-96 max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden p-6">
          <div className="text-center">No notifications available</div>
        </div>
      </div>
    );
  }

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') return !notification.is_read;
    return true;
  });

  const handleNotificationClick = (notification: any) => {
    // Mark as read if not already read
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navigate using the utility function
    const url = getNotificationUrl(notification);
    navigate(url);
    onClose();
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };



  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="fixed top-16 right-4 w-96 max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-100 to-teal-100 p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Notifications</h2>
                {unreadCount > 0 && (
                  <p className="text-gray-600 text-sm">{unreadCount} new updates</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-700 hover:bg-white/30 h-8 w-8 p-0"
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
                className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="px-6 pt-4 bg-white">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100">
              <TabsTrigger 
                value="all" 
                className="text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="unread" 
                className="text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
              >
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content */}
          <div className="bg-white">
            <TabsContent value="all" className="mt-0">
              <ScrollArea className="h-[400px]">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-600 px-6">
                    <div className="p-4 bg-gray-100 rounded-full mb-4">
                      <Bell className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="font-medium mb-1 text-gray-800">All caught up! 🎉</h3>
                    <p className="text-sm text-center text-gray-500">No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredNotifications.map((notification) => (
                      notification.type === 'comment_reply' ? (
                        <div key={notification.id} className="bg-white">
                          <ReplyNotificationItem
                            notification={notification}
                            onMarkAsRead={markAsRead}
                            onClick={onClose}
                          />
                        </div>
                      ) : (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-xl transition-all duration-200 cursor-pointer hover:bg-gray-50 group ${
                            !notification.is_read 
                              ? 'bg-blue-50 border-l-4 border-l-blue-500 shadow-sm' 
                              : 'bg-white hover:shadow-sm'
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <div className="text-sm text-gray-900 mb-1">
                                  <span className="font-medium">{notification.from_profile?.full_name || 'Someone'}</span>
                                  <span className="ml-1">{notification.message}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </span>
                                
                                {!notification.is_read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="unread" className="mt-0">
              <ScrollArea className="h-[400px]">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-600 px-6">
                    <div className="p-4 bg-gray-100 rounded-full mb-4">
                      <Check className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="font-medium mb-1 text-gray-800">All caught up! 🎉</h3>
                    <p className="text-sm text-center text-gray-500">No unread notifications</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 rounded-xl bg-white/10 border-l-4 border-l-white shadow-sm hover:bg-white/15 transition-all duration-200 cursor-pointer group"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <div className="text-sm text-white/90 mb-1">
                                <span className="font-medium">{notification.from_profile?.full_name || 'Someone'}</span>
                                <span className="ml-1">{notification.message}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-white/50">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </span>
                              
                              <div className="w-2 h-2 bg-white rounded-full"></div>
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
