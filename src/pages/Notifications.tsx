
import React, { useState } from 'react';
import NotificationHeader from '@/components/notifications/NotificationHeader';
import NotificationTabs from '@/components/notifications/NotificationTabs';
import NotificationSettings from '@/components/notifications/NotificationSettings';
import NotificationItem from '@/components/notifications/NotificationItem';
import EmptyNotifications from '@/components/notifications/EmptyNotifications';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showSettings, setShowSettings] = useState(false);

  // Mock notification data
  const notifications = [
    {
      id: '1',
      type: 'like' as const,
      user: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612bb10?w=150&h=150&fit=crop&crop=face',
        username: 'sarahj'
      },
      content: 'liked your post about Golden Retriever puppies',
      timestamp: '2m',
      isRead: false
    },
    {
      id: '2',
      type: 'comment' as const,
      user: {
        name: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        username: 'mikechen'
      },
      content: 'commented: "What a beautiful pup! Is he still available?"',
      timestamp: '15m',
      isRead: false
    },
    {
      id: '3',
      type: 'follow' as const,
      user: {
        name: 'Emma Davis',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        username: 'emmad'
      },
      content: 'started following you',
      timestamp: '1h',
      isRead: true
    },
    {
      id: '4',
      type: 'message' as const,
      user: {
        name: 'Alex Thompson',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        username: 'alexthompson'
      },
      content: 'sent you a message about the Labrador listing',
      timestamp: '2h',
      isRead: true
    },
    {
      id: '5',
      type: 'like' as const,
      user: {
        name: 'Jessica Wilson',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
        username: 'jessicaw'
      },
      content: 'liked your post about puppy training tips',
      timestamp: '3h',
      isRead: true
    },
    {
      id: '6',
      type: 'comment' as const,
      user: {
        name: 'David Lee',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        username: 'davidlee'
      },
      content: 'commented: "Great advice! My puppy loves these tips."',
      timestamp: '4h',
      isRead: true
    }
  ];

  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 'following':
        return ['like', 'comment'].includes(notification.type);
      case 'comments':
        return notification.type === 'comment';
      case 'follows':
        return notification.type === 'follow';
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-cloud-white">
      <NotificationHeader 
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />
      
      {showSettings && <NotificationSettings />}

      <div className="pt-4">
        <div className="px-4 mb-4">
          <h2 className="text-deep-navy font-semibold text-base mb-3">Last 7 days</h2>
        </div>
        
        <NotificationTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="px-4 space-y-1">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))
          ) : (
            <EmptyNotifications />
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
