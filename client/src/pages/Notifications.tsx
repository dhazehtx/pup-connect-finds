
import React, { useState } from 'react';
import NotificationHeader from '@/components/notifications/NotificationHeader';
import NotificationTabs from '@/components/notifications/NotificationTabs';
import NotificationSettings from '@/components/notifications/NotificationSettings';
import NotificationItem from '@/components/notifications/NotificationItem';
import EmptyNotifications from '@/components/notifications/EmptyNotifications';
import ReplyNotificationItem from '@/components/notifications/ReplyNotificationItem';
import { useNotifications } from '@/hooks/useNotifications';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [followingUsers, setFollowingUsers] = useState(new Set<string>());
  const { notifications, loading, markAsRead } = useNotifications();

  const handleFollowToggle = (username: string) => {
    setFollowingUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(username)) {
        newSet.delete(username);
      } else {
        newSet.add(username);
      }
      return newSet;
    });
  };

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'comments') return notification.type === 'comment_reply';
    if (activeTab === 'follows') return notification.type === 'follow';
    return true; // 'all' and 'following' show all notifications
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cloud-white to-soft-sky/30">
        <NotificationHeader showSettings={showSettings} onToggleSettings={() => setShowSettings(!showSettings)} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-blue mx-auto mb-4"></div>
            <p className="text-deep-navy">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mock notification data for older system compatibility
  const mockNotifications = [
    {
      id: 1,
      type: 'like',
      title: 'New Like',
      description: 'liked your post about Golden Retriever puppies',
      time: '2m',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612bb10?w=150&h=150&fit=crop&crop=face',
      username: 'sarahj',
      actionable: false,
      postImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop'
    },
    {
      id: 2,
      type: 'comment',
      title: 'New Comment',
      description: 'commented: "What a beautiful pup! Is he still available?"',
      time: '15m',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      username: 'mikechen',
      actionable: false,
      postImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop'
    },
    {
      id: 3,
      type: 'follow',
      title: 'New Follower',
      description: 'started following you',
      time: '1h',
      read: true,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      username: 'emmad',
      actionable: false
    },
    {
      id: 4,
      type: 'message',
      title: 'New Message',
      description: 'sent you a message about the Labrador listing',
      time: '2h',
      read: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      username: 'alexthompson',
      actionable: false
    },
    {
      id: 5,
      type: 'like',
      title: 'New Like',
      description: 'liked your post about puppy training tips',
      time: '3h',
      read: true,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
      username: 'jessicaw',
      actionable: false,
      postImage: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=150&h=150&fit=crop'
    },
    {
      id: 6,
      type: 'comment',
      title: 'New Comment',
      description: 'commented: "Great advice! My puppy loves these tips."',
      time: '4h',
      read: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      username: 'davidlee',
      actionable: false,
      postImage: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=150&h=150&fit=crop'
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
                followingUsers={followingUsers}
                onFollowToggle={handleFollowToggle}
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
