
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, UserPlus, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: any;
  followingUsers: Set<string>;
  onFollowToggle: (username: string) => void;
}

const NotificationItem = ({ notification, followingUsers, onFollowToggle }: NotificationItemProps) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      default:
        return <MessageCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const isFollowing = followingUsers.has(notification.username);

  return (
    <div className={`flex items-start gap-3 p-4 ${!notification.read ? 'bg-blue-50' : 'bg-white'}`}>
      <img
        src={notification.avatar}
        alt={notification.username}
        className="w-10 h-10 rounded-full object-cover"
      />
      
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {getIcon()}
              <span className="font-medium text-deep-navy">
                {notification.username}
              </span>
              <span className="text-gray-600 text-sm">
                {notification.description}
              </span>
            </div>
            
            <div className="text-xs text-gray-500 mb-2">
              {notification.time}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {notification.type === 'follow' && (
              <Button
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                onClick={() => onFollowToggle(notification.username)}
                className="text-xs h-7 px-3"
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
            
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {notification.postImage && (
          <div className="mt-2">
            <img
              src={notification.postImage}
              alt="Post"
              className="w-12 h-12 rounded object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
