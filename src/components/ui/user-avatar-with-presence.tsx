
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import PresenceIndicator from '@/components/ui/presence-indicator';
import { useUserPresence } from '@/hooks/useUserPresence';
import { cn } from '@/lib/utils';

interface UserAvatarWithPresenceProps {
  userId: string;
  username?: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  showPresence?: boolean;
  className?: string;
}

const UserAvatarWithPresence = ({
  userId,
  username,
  avatarUrl,
  size = 'md',
  showPresence = true,
  className
}: UserAvatarWithPresenceProps) => {
  const { getUserPresence, isUserOnline } = useUserPresence();
  
  const presence = getUserPresence(userId);
  const online = isUserOnline(userId);
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const presenceSize = {
    sm: 'sm' as const,
    md: 'sm' as const,
    lg: 'md' as const
  };

  return (
    <div className={cn('relative', className)}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={avatarUrl} alt={username} />
        <AvatarFallback>
          {username?.charAt(0)?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      
      {showPresence && (
        <div className="absolute -bottom-0.5 -right-0.5">
          <PresenceIndicator 
            status={online ? (presence?.status || 'online') : 'offline'}
            size={presenceSize[size]}
          />
        </div>
      )}
    </div>
  );
};

export default UserAvatarWithPresence;
