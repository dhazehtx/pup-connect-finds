
import React from 'react';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  maxCount?: number;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

const NotificationBadge = ({ count, className = "", maxCount = 99, variant = "destructive" }: NotificationBadgeProps) => {
  if (count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  const variantStyles = {
    default: "bg-primary text-primary-foreground",
    destructive: "bg-red-500 text-white",
    outline: "border border-input bg-background text-foreground",
    secondary: "bg-secondary text-secondary-foreground"
  };

  return (
    <div className={cn(
      "flex items-center justify-center text-xs font-medium rounded-full min-w-[20px] h-5 px-1",
      variantStyles[variant],
      className
    )}>
      {displayCount}
    </div>
  );
};

export default NotificationBadge;
