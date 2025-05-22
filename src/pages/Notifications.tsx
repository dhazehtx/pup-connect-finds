
import React from 'react';
import { Heart, MessageCircle, UserPlus, Star, Bell } from 'lucide-react';

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      type: 'message',
      title: 'New message from Golden Paws Kennel',
      description: 'The puppies will be ready for pickup next week!',
      time: '5 minutes ago',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 2,
      type: 'follow',
      title: 'Sarah Chen started following you',
      description: 'Check out their profile and recent activity',
      time: '2 hours ago',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 3,
      type: 'like',
      title: 'Your listing received 3 new likes',
      description: 'Golden Retriever puppies - 8 weeks old',
      time: '4 hours ago',
      read: true,
      avatar: null
    },
    {
      id: 4,
      type: 'review',
      title: 'New review from Mike Johnson',
      description: '5 stars - "Amazing breeder, highly recommended!"',
      time: '1 day ago',
      read: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 5,
      type: 'system',
      title: 'Profile verification completed',
      description: 'Your breeder profile has been successfully verified',
      time: '2 days ago',
      read: true,
      avatar: null
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
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
          Mark all as read
        </button>
      </div>

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
                    <h3 className={`text-sm font-semibold ${
                      notification.read ? 'text-gray-800' : 'text-gray-900'
                    }`}>
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {notification.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {notification.time}
                    </p>
                  </div>
                  
                  {!notification.read && (
                    <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State for older notifications */}
      <div className="text-center py-12">
        <Bell size={48} className="text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">You're all caught up!</h3>
        <p className="text-gray-500">No more notifications to show</p>
      </div>
    </div>
  );
};

export default Notifications;
