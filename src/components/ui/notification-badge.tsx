
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface NotificationBadgeProps {
  count: number;
  max?: number;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

const NotificationBadge = ({ 
  count, 
  max = 99, 
  className = "",
  variant = "destructive" 
}: NotificationBadgeProps) => {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <Badge 
      variant={variant}
      className={`
        absolute -top-2 -right-2 min-w-[20px] h-5 px-1.5 
        text-xs font-bold rounded-full flex items-center justify-center
        ${className}
      `}
    >
      {displayCount}
    </Badge>
  );
};

export default NotificationBadge;
