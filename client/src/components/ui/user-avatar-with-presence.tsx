
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUserPresence } from '@/hooks/useUserPresence';
import { cn } from '@/lib/utils';

interface UserAvatarWithPresenceProps {
  userId: string;
  username: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showStatus?: boolean;
}

const UserAvatarWithPresence = ({ 
  userId, 
  username, 
  avatarUrl, 
  size = 'md',
  className,
  showStatus = true
}: UserAvatarWithPresenceProps) => {
  const { getUserPresence } = useUserPresence();
  const presence = getUserPresence(userId);
  const isOnline = presence?.status === 'online';

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-12 h-12'
  };

  const statusSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className={cn('relative', className)}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={avatarUrl} alt={username} />
        <AvatarFallback>
          {username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {showStatus && isOnline && (
        <div className={cn(
          'absolute bottom-0 right-0 rounded-full bg-green-500 border-2 border-white',
          statusSizeClasses[size]
        )} />
      )}
    </div>
  );
};

export default UserAvatarWithPresence;
