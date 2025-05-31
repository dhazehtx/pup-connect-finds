
import React from 'react';
import { cn } from '@/lib/utils';

interface PresenceIndicatorProps {
  status: 'online' | 'away' | 'busy' | 'offline';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const PresenceIndicator = ({ 
  status, 
  size = 'md', 
  showLabel = false, 
  className 
}: PresenceIndicatorProps) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const statusConfig = {
    online: {
      color: 'bg-green-500',
      label: 'Online',
      ring: 'ring-green-500/20'
    },
    away: {
      color: 'bg-yellow-500',
      label: 'Away',
      ring: 'ring-yellow-500/20'
    },
    busy: {
      color: 'bg-red-500',
      label: 'Busy',
      ring: 'ring-red-500/20'
    },
    offline: {
      color: 'bg-gray-400',
      label: 'Offline',
      ring: 'ring-gray-400/20'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'rounded-full ring-2',
        sizeClasses[size],
        config.color,
        config.ring
      )} />
      {showLabel && (
        <span className="text-xs text-gray-600">{config.label}</span>
      )}
    </div>
  );
};

export default PresenceIndicator;
