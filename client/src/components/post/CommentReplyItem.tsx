import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface CommentReply {
  id: string;
  comment_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

interface CommentReplyItemProps {
  reply: CommentReply;
  onProfileClick?: (userId: string) => void;
}

const CommentReplyItem: React.FC<CommentReplyItemProps> = ({ 
  reply, 
  onProfileClick 
}) => {
  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick(reply.user_id);
    }
  };

  const displayName = reply.profiles?.full_name || reply.profiles?.username || 'Unknown User';
  const username = reply.profiles?.username || 'unknown';
  const avatar = reply.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${reply.user_id}`;

  return (
    <div className="flex gap-2 pl-8 pt-2">
      <Avatar 
        className="h-6 w-6 cursor-pointer hover:opacity-80 transition-opacity" 
        onClick={handleProfileClick}
      >
        <AvatarImage src={avatar} />
        <AvatarFallback className="text-xs">
          {displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span 
            className="font-semibold text-sm cursor-pointer hover:underline"
            onClick={handleProfileClick}
          >
            {username}
          </span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
          </span>
        </div>
        
        <p className="text-sm text-gray-700 break-words">
          {reply.content}
        </p>
      </div>
    </div>
  );
};

export default CommentReplyItem;