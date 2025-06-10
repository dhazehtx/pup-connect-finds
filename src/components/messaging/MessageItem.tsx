
import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageItemProps {
  message: any;
  isOwn: boolean;
  user: any;
  reactions: any[];
  threadCount: number;
  onReactionButtonClick: (event: React.MouseEvent, messageId: string) => void;
  onReplyButtonClick: () => void;
  onReactionToggle: (messageId: string, emoji: string) => void;
  conversationId: string;
}

const MessageItem = ({
  message,
  isOwn,
  user,
  reactions,
  threadCount,
  onReactionButtonClick,
  onReplyButtonClick,
  onReactionToggle,
  conversationId
}: MessageItemProps) => {
  const messageTime = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const hasReactions = reactions && reactions.length > 0;

  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'image':
        return message.image_url ? (
          <div className="mt-2 rounded-md overflow-hidden">
            <img
              src={message.image_url}
              alt="Shared image"
              className="max-w-[240px] max-h-[240px] object-contain"
            />
            <p className="mt-1">{message.content}</p>
          </div>
        ) : (
          <p>{message.content}</p>
        );
      case 'voice':
        return (
          <div className="mt-2">
            <audio src={message.image_url} controls className="max-w-full" />
            <p className="mt-1 text-xs opacity-75">{message.content}</p>
          </div>
        );
      case 'file':
        return (
          <div className="mt-2">
            <a
              href={message.image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 bg-background rounded-md border"
            >
              <span className="truncate">{message.content}</span>
            </a>
          </div>
        );
      default:
        return <p>{message.content}</p>;
    }
  };

  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-lg p-3",
          isOwn
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "bg-muted rounded-tl-none"
        )}
      >
        {renderMessageContent()}
        
        <div className="flex items-center justify-between mt-1 text-xs">
          <span className={cn("opacity-70", isOwn ? "text-primary-foreground" : "text-muted-foreground")}>
            {messageTime}
          </span>
        </div>
        
        {hasReactions && (
          <div className="flex flex-wrap gap-1 mt-1">
            {reactions.map((reaction, index) => (
              <Button 
                key={`${reaction.emoji}-${index}`}
                variant="ghost" 
                size="sm"
                className="h-6 px-1 py-0 text-xs"
                onClick={() => onReactionToggle(message.id, reaction.emoji)}
              >
                {reaction.emoji} {reaction.count}
              </Button>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 rounded-full"
            onClick={(e) => onReactionButtonClick(e, message.id)}
          >
            <ThumbsUp className="h-3 w-3" />
            <span className="sr-only">React</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 rounded-full"
            onClick={onReplyButtonClick}
          >
            <MessageCircle className="h-3 w-3" />
            <span className="sr-only">Reply</span>
          </Button>
          
          {threadCount > 0 && (
            <span className="text-xs ml-1">
              {threadCount} {threadCount === 1 ? 'reply' : 'replies'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
