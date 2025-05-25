import React, { useState } from 'react';
import NotificationHeader from '@/components/notifications/NotificationHeader';
import NotificationTabs from '@/components/notifications/NotificationTabs';
import NotificationSettings from '@/components/notifications/NotificationSettings';
import NotificationItem from '@/components/notifications/NotificationItem';

const Notifications = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [followingUsers, setFollowingUsers] = useState(new Set(['sarah_chen', 'mike_johnson', 'golden_paws']));
  
  const notifications = [
    {
      id: 1,
      type: 'comment',
      title: 'angelina99 commented on a post you\'re tagged in',
      description: 'commented on a post you\'re tagged in: Awww',
      time: '1d',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      username: 'angelina99',
      postImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=50&h=50&fit=crop'
    },
    {
      id: 2,
      type: 'like',
      title: 'strawberrymama posted a thread you might like',
      description: 'posted a thread you might like: Buy Me Dr Pepper Is well I hear 😊',
      time: '2d',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      username: 'strawberrymama'
    },
    {
      id: 3,
      type: 'follow',
      title: 'family_first_88 started following you',
      description: 'started following you.',
      time: '2d',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      username: 'family_first_88'
    },
    {
      id: 4,
      type: 'like',
      title: 'don_arredondo92, marianna.7 and others liked your story',
      description: 'and others liked your story.',
      time: '4d',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
      username: 'don_arredondo92',
      postImage: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=50&h=50&fit=crop'
    },
    {
      id: 5,
      type: 'like',
      title: 'dejanmusk and kylahickks liked your story',
      description: 'liked your story.',
      time: '4d',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=40&h=40&fit=crop&crop=face',
      username: 'dejanmusk',
      postImage: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=50&h=50&fit=crop'
    },
    {
      id: 6,
      type: 'like',
      title: 'kylahickks liked your story',
      description: 'liked your story.',
      time: '5d',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
      username: 'kylahickks',
      postImage: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=50&h=50&fit=crop'
    },
    {
      id: 7,
      type: 'comment',
      title: 'kylahickks mentioned you in a comment',
      description: 'mentioned you in a comment: @pmoney_htxx "queens 👑 😍"',
      time: '5d',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
      username: 'kylahickks',
      postImage: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=50&h=50&fit=crop'
    },
    {
      id: 8,
      type: 'like',
      title: 'kylahickks liked your comment',
      description: 'liked your comment: Queen 👑',
      time: '5d',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
      username: 'kylahickks',
      postImage: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=50&h=50&fit=crop'
    }
  ];

  const handleFollowToggle = (username: string) => {
    const newFollowing = new Set(followingUsers);
    if (newFollowing.has(username)) {
      newFollowing.delete(username);
    } else {
      newFollowing.add(username);
    }
    setFollowingUsers(newFollowing);
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 'following':
        return notification.username && followingUsers.has(notification.username);
      case 'comments':
        return notification.type === 'comment';
      case 'follows':
        return notification.type === 'follow';
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-white">
      <NotificationHeader 
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />

      {showSettings && <NotificationSettings />}

      <div className="pt-4">
        <div className="px-4 mb-4">
          <h2 className="text-gray-800 font-semibold text-base mb-3">Last 7 days</h2>
        </div>
        
        <NotificationTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="space-y-0">
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              followingUsers={followingUsers}
              onFollowToggle={handleFollowToggle}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
