import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Settings } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const { notifications = [], loading, markAsRead, unreadCount } = useNotifications() || {};
  const { user } = useAuth();

  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    // Handle navigation based on notification type
    // For now, we'll just mark as read
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="p-4 text-center">
          <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Login Required
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Please log in to view your notifications
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-800 dark:to-purple-800 text-gray-800 dark:text-white p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <h1 className="text-xl font-bold">Notifications</h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-700 dark:text-white hover:bg-white/20"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="p-4 max-w-md mx-auto">
        <div className="flex rounded-lg bg-white dark:bg-gray-800 p-1 shadow-sm border border-gray-200 dark:border-gray-700">
          <Button
            variant={activeTab === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('all')}
            className="flex-1 rounded-md"
          >
            All
          </Button>
          <Button
            variant={activeTab === 'unread' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('unread')}
            className="flex-1 rounded-md relative"
          >
            Unread
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-20 max-w-md mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <Bell className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              {activeTab === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {activeTab === 'unread' 
                ? 'You have no unread notifications' 
                : 'When you get notifications, they\'ll show up here'
              }
            </p>
          </div>
        ) : (
          /* Notification List */
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 rounded-lg shadow-sm border cursor-pointer transition-colors ${
                  notification.is_read
                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                }`}
              >
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {notification.type?.charAt(0)?.toUpperCase() || 'N'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm leading-5 ${
                          notification.is_read 
                            ? 'text-gray-700 dark:text-gray-300' 
                            : 'text-gray-900 dark:text-white font-medium'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;