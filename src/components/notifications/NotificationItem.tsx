
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getNotificationIcon, getTypeLabel } from '@/utils/notificationUtils';
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
  };
  followingUsers: Set<string>;
  onFollowToggle: (username: string) => void;
}

const NotificationItem = ({ notification, followingUsers, onFollowToggle }: NotificationItemProps) => {
  return (
    <div
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
              {getNotificationIcon(notification.type)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`text-sm font-semibold ${
                  notification.read ? 'text-gray-800' : 'text-gray-900'
                }`}>
                  {notification.title}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {getTypeLabel(notification.type)}
                </Badge>
                {/* Follow/Following indicator */}
                {notification.username && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">@{notification.username}</span>
                    <FollowButton
                      username={notification.username}
                      isFollowing={followingUsers.has(notification.username)}
                      onToggle={onFollowToggle}
                    />
                  </div>
                )}
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

          {/* Quick actions for likes and comments */}
          {(notification.type === 'like' || notification.type === 'comment') && (
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline">
                View Post
              </Button>
              {notification.type === 'comment' && (
                <Button size="sm" variant="outline">
                  Reply
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
