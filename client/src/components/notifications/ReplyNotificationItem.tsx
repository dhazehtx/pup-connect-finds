import React from 'react';
import { MessageCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface ReplyNotificationItemProps {
  notification: {
    id: string;
    type: string;
    from_user_id: string;
    post_id?: string | null;
    comment_id?: string | null;
    message: string;
    is_read: boolean;
    created_at: string;
    from_profile?: {
      full_name: string | null;
      username: string | null;
      avatar_url: string | null;
    } | null;
  };
  onMarkAsRead: (id: string) => void;
  onClick?: () => void;
}

const ReplyNotificationItem = ({ notification, onMarkAsRead, onClick }: ReplyNotificationItemProps) => {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }

    // Navigate to the post with comment highlighting if post_id exists
    if (notification.post_id) {
      const url = notification.comment_id 
        ? `/posts/${notification.post_id}?comment=${notification.comment_id}`
        : `/posts/${notification.post_id}`;
      setLocation(url);
    }

    if (onClick) {
      onClick();
    }
  };

  const senderName = notification.from_profile?.full_name || 
                    notification.from_profile?.username || 
                    'Someone';

  return (
    <div 
      className={`p-4 border-l-4 transition-all duration-300 cursor-pointer hover:bg-gray-50 hover:border-purple-600 transform hover:scale-[1.01] ${
        !notification.is_read 
          ? 'border-purple-500 bg-purple-50/50 shadow-sm' 
          : 'border-gray-200 bg-white'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Avatar or Icon */}
        <div className="flex-shrink-0">
          {notification.from_profile?.avatar_url ? (
            <img
              src={notification.from_profile.avatar_url}
              alt={senderName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-purple-600" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-medium text-purple-600">{senderName}</span>
                <span className="ml-1">replied to your comment</span>
              </p>
              
              {/* Show a preview of the original message if available */}
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                "{notification.message}"
              </p>
            </div>

            {/* Unread indicator */}
            {!notification.is_read && (
              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2"></div>
            )}
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyNotificationItem;