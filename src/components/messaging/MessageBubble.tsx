
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck, Download } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    message_type: string;
    image_url?: string;
    created_at: string;
    read_at?: string;
    sender_id: string;
  };
  sender: {
    full_name: string;
    avatar_url?: string;
  };
  isOwn: boolean;
  isLast?: boolean;
}

const MessageBubble = ({ message, sender, isOwn, isLast }: MessageBubbleProps) => {
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'image':
        return (
          <div className="max-w-xs">
            {message.image_url && (
              <img
                src={message.image_url}
                alt="Shared image"
                className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.image_url, '_blank')}
              />
            )}
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        );
      
      case 'file':
        return (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg max-w-xs">
            <div className="flex-1">
              <p className="text-sm font-medium truncate">{message.content}</p>
              <p className="text-xs text-gray-500">Document</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => message.image_url && window.open(message.image_url, '_blank')}
            >
              <Download size={16} />
            </Button>
          </div>
        );
      
      default:
        return <p className="text-sm break-words">{message.content}</p>;
    }
  };

  const getStatusIcon = () => {
    if (!isOwn) return null;
    
    if (message.read_at) {
      return <CheckCheck size={14} className="text-blue-500" />;
    }
    return <Check size={14} className="text-gray-400" />;
  };

  return (
    <div className={cn(
      "flex gap-3 mb-4",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      {!isOwn && (
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarImage src={sender.avatar_url} />
          <AvatarFallback>
            {sender.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn(
        "max-w-[70%] space-y-1",
        isOwn ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "rounded-2xl px-3 py-2",
          isOwn 
            ? "bg-blue-500 text-white rounded-br-md" 
            : "bg-gray-100 text-gray-900 rounded-bl-md"
        )}>
          {renderMessageContent()}
        </div>
        
        <div className={cn(
          "flex items-center gap-1 text-xs text-gray-500",
          isOwn ? "justify-end" : "justify-start"
        )}>
          <span>{timeAgo}</span>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
