
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface UserPresenceIndicatorProps {
  userId: string;
  username?: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen?: string;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  className?: string;
}

const UserPresenceIndicator = ({
  userId,
  username,
  avatarUrl,
  isOnline,
  lastSeen,
  size = 'md',
  showStatus = true,
  className
}: UserPresenceIndicatorProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const statusSize = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const getLastSeenText = () => {
    if (isOnline) return 'Online';
    if (!lastSeen) return 'Offline';
    return `Last seen ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`;
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={avatarUrl} alt={username} />
          <AvatarFallback>
            {username?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        {/* Online status indicator */}
        <div className={cn(
          'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white',
          statusSize[size],
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        )} />
      </div>

      {showStatus && (
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{username}</p>
          <p className={cn(
            'text-xs truncate',
            isOnline ? 'text-green-600' : 'text-gray-500'
          )}>
            {getLastSeenText()}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserPresenceIndicator;
