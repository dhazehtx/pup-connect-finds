
import React from 'react';
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import UserAvatarWithPresence from '@/components/ui/user-avatar-with-presence';
import { useUserPresence } from '@/hooks/useUserPresence';
import { cn } from '@/lib/utils';

interface OnlineUsersListProps {
  variant?: 'compact' | 'detailed';
  maxVisible?: number;
  className?: string;
}

const OnlineUsersList = ({ 
  variant = 'compact', 
  maxVisible = 5,
  className 
}: OnlineUsersListProps) => {
  const { onlineUsers, onlineCount } = useUserPresence();

  if (onlineCount === 0) {
    return (
      <div className={cn('flex items-center gap-2 text-gray-500', className)}>
        <Users size={16} />
        <span className="text-sm">No users online</span>
      </div>
    );
  }

  const visibleUsers = onlineUsers.slice(0, maxVisible);
  const remainingCount = Math.max(0, onlineCount - maxVisible);

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex -space-x-2">
          {visibleUsers.map((user) => (
            <UserAvatarWithPresence
              key={user.user_id}
              userId={user.user_id}
              username={user.username}
              avatarUrl={user.avatar_url}
              size="sm"
              className="ring-2 ring-white"
            />
          ))}
        </div>
        <Badge variant="secondary" className="text-xs">
          <Users size={12} className="mr-1" />
          {onlineCount} online
        </Badge>
        {remainingCount > 0 && (
          <span className="text-xs text-gray-500">+{remainingCount} more</span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <Users size={16} className="text-gray-600" />
        <span className="font-medium text-sm">Online Users ({onlineCount})</span>
      </div>
      
      <div className="space-y-2">
        {visibleUsers.map((user) => (
          <div key={user.user_id} className="flex items-center gap-3">
            <UserAvatarWithPresence
              userId={user.user_id}
              username={user.username}
              avatarUrl={user.avatar_url}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.username}</p>
              <p className="text-xs text-gray-500 capitalize">{user.status}</p>
            </div>
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className="text-center">
            <span className="text-xs text-gray-500">+{remainingCount} more users online</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineUsersList;
