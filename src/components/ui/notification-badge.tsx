
import React from 'react';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  maxCount?: number;
}

const NotificationBadge = ({ count, className = "", maxCount = 99 }: NotificationBadgeProps) => {
  if (count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <div className={cn(
      "flex items-center justify-center bg-red-500 text-white text-xs font-medium rounded-full min-w-[20px] h-5 px-1",
      className
    )}>
      {displayCount}
    </div>
  );
};

export default NotificationBadge;
