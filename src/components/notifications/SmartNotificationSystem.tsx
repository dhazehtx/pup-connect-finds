
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bell, MessageCircle, DollarSign, Heart, TrendingUp, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  type: 'message' | 'price_drop' | 'new_listing' | 'transaction' | 'favorite';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

const SmartNotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'message',
      title: 'New Message',
      message: 'Sarah sent you a message about Golden Retriever listing',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      actionUrl: '/messages'
    },
    {
      id: '2',
      type: 'price_drop',
      title: 'Price Drop Alert',
      message: 'French Bulldog puppy price dropped to $2,800 (was $3,200)',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      actionUrl: '/explore'
    },
    {
      id: '3',
      type: 'new_listing',
      title: 'New Listing Match',
      message: 'New Golden Retriever puppy matches your saved search',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: true,
      actionUrl: '/explore'
    }
  ]);

  const [settings, setSettings] = useState({
    newMessages: true,
    priceDrops: true,
    newListings: true,
    transactionUpdates: true,
    marketingEmails: false,
    pushNotifications: true
  });

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of new notification
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: ['message', 'price_drop', 'new_listing'][Math.floor(Math.random() * 3)] as any,
          title: 'New Notification',
          message: 'This is a simulated real-time notification',
          timestamp: new Date(),
          read: false
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
        
        if (settings.pushNotifications) {
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [settings.pushNotifications, toast]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return MessageCircle;
      case 'price_drop': return DollarSign;
      case 'new_listing': return TrendingUp;
      case 'transaction': return DollarSign;
      case 'favorite': return Heart;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message': return 'text-blue-500';
      case 'price_drop': return 'text-green-500';
      case 'new_listing': return 'text-purple-500';
      case 'transaction': return 'text-orange-500';
      case 'favorite': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell size={24} />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
            )}
          </h1>
          <p className="text-gray-600">Stay updated on your puppy search</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            Mark All Read
          </Button>
          <Button variant="outline">
            <Settings className="mr-2" size={16} />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map(notification => {
                    const IconComponent = getNotificationIcon(notification.type);
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          notification.read ? 'bg-white' : 'bg-blue-50 border-blue-200'
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <IconComponent 
                            size={20} 
                            className={`mt-1 ${getNotificationColor(notification.type)}`} 
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium">{notification.title}</h4>
                              <span className="text-xs text-gray-500">
                                {notification.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            {!notification.read && (
                              <div className="mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  New
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No notifications yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notification Settings */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Messages</p>
                  <p className="text-sm text-gray-600">Get notified of new messages</p>
                </div>
                <Switch
                  checked={settings.newMessages}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, newMessages: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Price Drops</p>
                  <p className="text-sm text-gray-600">Alert when saved listings drop in price</p>
                </div>
                <Switch
                  checked={settings.priceDrops}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, priceDrops: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Listings</p>
                  <p className="text-sm text-gray-600">Notify when new matches are found</p>
                </div>
                <Switch
                  checked={settings.newListings}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, newListings: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Transaction Updates</p>
                  <p className="text-sm text-gray-600">Updates on payment and meeting status</p>
                </div>
                <Switch
                  checked={settings.transactionUpdates}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, transactionUpdates: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-600">Receive browser notifications</p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, pushNotifications: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Unread notifications</span>
                <Badge>{unreadCount}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">This week</span>
                <span className="text-sm font-medium">{notifications.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Messages</span>
                <span className="text-sm font-medium">
                  {notifications.filter(n => n.type === 'message').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SmartNotificationSystem;
