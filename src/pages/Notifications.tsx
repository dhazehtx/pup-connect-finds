
import React, { useState } from 'react';
import NotificationHeader from '@/components/notifications/NotificationHeader';
import NotificationSettings from '@/components/notifications/NotificationSettings';
import NotificationItem from '@/components/notifications/NotificationItem';
import EmptyNotifications from '@/components/notifications/EmptyNotifications';
import FollowRequestsManager from '@/components/profile/FollowRequestsManager';

const Notifications = () => {
  const [showSettings, setShowSettings] = useState(false);

  // Mock follow requests data (Instagram style)
  const mockFollowRequests = [
    {
      id: '1',
      requesterId: 'user1',
      requesterName: 'Sarah Johnson',
      requesterUsername: 'sarah_j',
      requesterAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
      requesterVerified: true,
      requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    },
    {
      id: '2',
      requesterId: 'user2',
      requesterName: 'Mike Davis',
      requesterUsername: 'mike_d',
      requesterAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      requesterVerified: false,
      requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    }
  ];

  // Mock notification data
  const notifications = [
    {
      id: 1,
      type: 'like',
      title: 'New Like',
      description: 'liked your post about Golden Retriever puppies',
      time: '2m',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
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
    }
  ];

  const handleFollowRequestAction = async (requestId: string, action: 'approve' | 'decline') => {
    // Mock implementation - in real app, this would call an API
    console.log(`${action} follow request ${requestId}`);
    // Remove the request from the list after action
    // setFollowRequests(prev => prev.filter(req => req.id !== requestId));
  };

  return (
    <div className="min-h-screen bg-cloud-white">
      <NotificationHeader 
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />
      
      {showSettings && <NotificationSettings />}

      <div className="pt-4">
        {/* Follow Requests Section */}
        {mockFollowRequests.length > 0 && (
          <div className="px-4 mb-6">
            <FollowRequestsManager 
              requests={mockFollowRequests}
              onRequestAction={handleFollowRequestAction}
            />
          </div>
        )}

        {/* All Notifications Section */}
        <div className="px-4 space-y-1">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                followingUsers={new Set<string>()}
                onFollowToggle={() => {}}
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
