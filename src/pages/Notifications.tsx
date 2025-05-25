
import React, { useState } from 'react';
import { Heart, MessageCircle, UserPlus, Star, Bell, TrendingDown, Search, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const Notifications = () => {
  const [showSettings, setShowSettings] = useState(false);
  
  const notifications = [
    {
      id: 1,
      type: 'price_drop',
      title: 'Price drop alert!',
      description: 'Golden Retriever puppies dropped from $3,200 to $2,800',
      time: '10 minutes ago',
      read: false,
      avatar: null,
      actionable: true
    },
    {
      id: 2,
      type: 'new_listing',
      title: 'New listing matches your search',
      description: 'French Bulldog puppy in San Francisco - Blue Fawn color',
      time: '1 hour ago',
      read: false,
      avatar: null,
      actionable: true
    },
    {
      id: 3,
      type: 'message',
      title: 'New message from Golden Paws Kennel',
      description: 'The puppies will be ready for pickup next week!',
      time: '2 hours ago',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 4,
      type: 'application',
      title: 'Adoption application approved',
      description: 'Your application for "Bella" has been approved by the shelter',
      time: '4 hours ago',
      read: false,
      avatar: null
    },
    {
      id: 5,
      type: 'follow',
      title: 'Sarah Chen started following you',
      description: 'Check out their profile and recent activity',
      time: '1 day ago',
      read: true,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 6,
      type: 'review',
      title: 'New review from Mike Johnson',
      description: '5 stars - "Amazing breeder, highly recommended!"',
      time: '2 days ago',
      read: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle size={16} className="text-blue-500" />;
      case 'follow':
        return <UserPlus size={16} className="text-green-500" />;
      case 'like':
        return <Heart size={16} className="text-red-500" />;
      case 'review':
        return <Star size={16} className="text-amber-500" />;
      case 'price_drop':
        return <TrendingDown size={16} className="text-orange-500" />;
      case 'new_listing':
        return <Search size={16} className="text-purple-500" />;
      case 'application':
        return <FileCheck size={16} className="text-green-600" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'price_drop': return 'Price Alert';
      case 'new_listing': return 'New Match';
      case 'application': return 'Application';
      case 'message': return 'Message';
      case 'follow': return 'Follow';
      case 'review': return 'Review';
      default: return 'Notification';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            Settings
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-amber-600 hover:text-amber-700"
          >
            Mark all as read
          </Button>
        </div>
      </div>

      {/* Notification Settings */}
      {showSettings && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="price-alerts">Price drop alerts</Label>
                <Switch id="price-alerts" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="new-listings">New listing matches</Label>
                <Switch id="new-listings" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="messages">Chat messages</Label>
                <Switch id="messages" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="applications">Application updates</Label>
                <Switch id="applications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="follows">New followers</Label>
                <Switch id="follows" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="reviews">Reviews & ratings</Label>
                <Switch id="reviews" defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-xl p-4 border transition-all hover:shadow-md ${
              notification.read 
                ? 'border-gray-200' 
                : 'border-amber-200 bg-amber-50/30'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Avatar or Icon */}
              <div className="flex-shrink-0">
                {notification.avatar ? (
                  <img
                    src={notification.avatar}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    {getIcon(notification.type)}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-semibold ${
                        notification.read ? 'text-gray-800' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(notification.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {notification.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {notification.time}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {notification.actionable && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">
                      View Listing
                    </Button>
                    {notification.type === 'price_drop' && (
                      <Button size="sm">
                        Save Deal
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      <div className="text-center py-12">
        <Bell size={48} className="text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">You're all caught up!</h3>
        <p className="text-gray-500">No more notifications to show</p>
      </div>
    </div>
  );
};

export default Notifications;
