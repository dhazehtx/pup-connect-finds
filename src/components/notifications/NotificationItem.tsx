
import React from 'react';
import { Button } from '@/components/ui/button';
import { getNotificationIcon } from '@/utils/notificationUtils';
import FollowButton from './FollowButton';

interface NotificationItemProps {
  notification: {
    id: number;
    type: string;
    title: string;
    description: string;
    time: string;
    read: boolean;
    avatar?: string | null;
    username?: string;
    actionable?: boolean;
    postImage?: string;
  };
  followingUsers: Set<string>;
  onFollowToggle: (username: string) => void;
}

const NotificationItem = ({ notification, followingUsers, onFollowToggle }: NotificationItemProps) => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-900/50 transition-colors">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {notification.avatar ? (
          <img
            src={notification.avatar}
            alt=""
            className="w-11 h-11 rounded-full object-cover"
          />
        ) : (
          <div className="w-11 h-11 bg-gray-700 rounded-full flex items-center justify-center">
            {getNotificationIcon(notification.type)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm leading-tight">
              <span className="font-semibold">
                {notification.username || 'System'}
              </span>{' '}
              <span className="text-gray-300">
                {notification.description}
              </span>{' '}
              <span className="text-gray-500 text-xs">
                {notification.time}
              </span>
            </p>
            
            {/* Action buttons for certain notification types */}
            {(notification.type === 'comment' || notification.type === 'like') && (
              <div className="flex gap-2 mt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 px-3 text-xs bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Reply
                </Button>
              </div>
            )}
          </div>

          {/* Right side content */}
          <div className="flex items-center gap-2 ml-3">
            {/* Follow button for follow notifications */}
            {notification.type === 'follow' && notification.username && (
              <FollowButton
                username={notification.username}
                isFollowing={followingUsers.has(notification.username)}
                onToggle={onFollowToggle}
              />
            )}
            
            {/* Post thumbnail */}
            {notification.postImage && (
              <img
                src={notification.postImage}
                alt=""
                className="w-11 h-11 rounded object-cover"
              />
            )}
            
            {/* Unread indicator */}
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
