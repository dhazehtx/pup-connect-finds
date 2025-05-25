import React, { useState } from 'react';
import NotificationHeader from '@/components/notifications/NotificationHeader';
import NotificationSettings from '@/components/notifications/NotificationSettings';
import NotificationItem from '@/components/notifications/NotificationItem';
import EmptyNotifications from '@/components/notifications/EmptyNotifications';

const Notifications = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [followingUsers, setFollowingUsers] = useState(new Set(['sarah_chen', 'mike_johnson', 'golden_paws']));
  
  const notifications = [
    {
      id: 1,
      type: 'like',
      title: 'Sarah Chen liked your post',
      description: 'Your Golden Retriever puppy photo got a new like',
      time: '5 minutes ago',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      username: 'sarah_chen'
    },
    {
      id: 2,
      type: 'comment',
      title: 'Mike Johnson commented on your post',
      description: '"Beautiful puppies! Are they still available?"',
      time: '8 minutes ago',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      username: 'mike_johnson'
    },
    {
      id: 3,
      type: 'price_drop',
      title: 'Price drop alert!',
      description: 'Golden Retriever puppies dropped from $3,200 to $2,800',
      time: '10 minutes ago',
      read: false,
      avatar: null,
      actionable: true
    },
    {
      id: 4,
      type: 'like',
      title: 'Golden Paws Kennel liked your review',
      description: 'They appreciated your 5-star review',
      time: '15 minutes ago',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=40&h=40&fit=crop&crop=face',
      username: 'golden_paws'
    },
    {
      id: 5,
      type: 'follow',
      title: 'Emma Wilson started following you',
      description: 'Check out their profile and recent activity',
      time: '30 minutes ago',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      username: 'emma_wilson'
    },
    {
      id: 6,
      type: 'comment',
      title: 'Alex Rivera commented on your post',
      description: '"Do you have any female puppies available?"',
      time: '45 minutes ago',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
      username: 'alex_rivera'
    },
    {
      id: 7,
      type: 'new_listing',
      title: 'New listing matches your search',
      description: 'French Bulldog puppy in San Francisco - Blue Fawn color',
      time: '1 hour ago',
      read: false,
      avatar: null,
      actionable: true
    },
    {
      id: 8,
      type: 'message',
      title: 'New message from Golden Paws Kennel',
      description: 'The puppies will be ready for pickup next week!',
      time: '2 hours ago',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=40&h=40&fit=crop&crop=face',
      username: 'golden_paws'
    },
    {
      id: 9,
      type: 'like',
      title: 'Jessica Park and 12 others liked your post',
      description: 'Your Labrador training video is getting lots of love!',
      time: '3 hours ago',
      read: true,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
      username: 'jessica_park'
    },
    {
      id: 10,
      type: 'application',
      title: 'Adoption application approved',
      description: 'Your application for "Bella" has been approved by the shelter',
      time: '4 hours ago',
      read: true,
      avatar: null
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <NotificationHeader 
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />

      {showSettings && <NotificationSettings />}

      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            followingUsers={followingUsers}
            onFollowToggle={handleFollowToggle}
          />
        ))}
      </div>

      <EmptyNotifications />
    </div>
  );
};

export default Notifications;
