
import { formatDistanceToNow } from 'date-fns';

export const formatPostTime = (createdAt: string): string => {
  const now = new Date();
  const postDate = new Date(createdAt);
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
  
  // Show "Just now" for posts less than 60 seconds old
  if (diffInSeconds < 60) {
    return "Just now";
  }
  
  // Use date-fns for everything else (shows "X minutes ago", "X hours ago", etc.)
  return formatDistanceToNow(postDate, { addSuffix: true });
};
