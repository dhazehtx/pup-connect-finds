
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    message_type?: string;
    image_url?: string;
    read_at?: string;
  };
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string;
  showAvatar?: boolean;
}

const MessageBubble = ({ message, isOwn, senderName, senderAvatar, showAvatar = true }: MessageBubbleProps) => {
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  return (
    <div className={`flex gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {showAvatar && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={senderAvatar} />
          <AvatarFallback>
            {senderName?.charAt(0) || (isOwn ? 'Y' : 'U')}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'text-right' : 'text-left'}`}>
        <div
          className={`rounded-lg px-3 py-2 ${
            isOwn
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {message.message_type === 'image' && message.image_url && (
            <img
              src={message.image_url}
              alt="Shared image"
              className="rounded mb-2 max-w-full h-auto"
            />
          )}
          {message.content && (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
        
        <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span>{timeAgo}</span>
          {isOwn && message.read_at && (
            <Badge variant="secondary" className="text-xs">
              Read
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
