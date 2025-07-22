
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, MoreHorizontal, Reply } from 'lucide-react';
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
}: MessageItemProps) => {
  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const getReactionCounts = () => {
    const counts: Record<string, number> = {};
    reactions.forEach(reaction => {
      counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
    });
    return counts;
  };

  const hasUserReacted = (emoji: string) => {
    return reactions.some(r => r.user_id === user?.id && r.emoji === emoji);
  };

  const reactionCounts = getReactionCounts();

  return (
    <div className={cn(
      "flex gap-3 p-4 hover:bg-muted/30 transition-colors group",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      {!isOwn && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarImage src="" />
          <AvatarFallback className="text-xs">U</AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn("flex-1 space-y-2", isOwn ? "text-right" : "text-left")}>
        <div className={cn(
          "inline-block max-w-[70%] rounded-2xl px-4 py-2 text-sm",
          isOwn 
            ? "bg-primary text-primary-foreground rounded-br-sm" 
            : "bg-muted rounded-bl-sm"
        )}>
          {message.message_type === 'text' ? (
            <p>{message.content}</p>
          ) : message.message_type === 'image' ? (
            <div className="space-y-2">
              <img 
                src={message.image_url} 
                alt="Shared image" 
                className="max-w-full rounded-lg"
              />
              {message.content && <p>{message.content}</p>}
            </div>
          ) : message.message_type === 'voice' ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-current rounded-full"></div>
              <span>Voice message</span>
            </div>
          ) : (
            <p>{message.content}</p>
          )}
        </div>

        {/* Reactions */}
        {Object.keys(reactionCounts).length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <Button
                key={emoji}
                variant="outline"
                size="sm"
                className={cn(
                  "h-6 px-2 text-xs rounded-full",
                  hasUserReacted(emoji) && "bg-primary/10 border-primary"
                )}
                onClick={() => onReactionToggle(message.id, emoji)}
              >
                {emoji} {count}
              </Button>
            ))}
          </div>
        )}

        {/* Message actions and info */}
        <div className={cn(
          "flex items-center gap-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity",
          isOwn ? "justify-end" : "justify-start"
        )}>
          <span>{formatTime(message.created_at)}</span>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            onClick={(e) => onReactionButtonClick(e, message.id)}
          >
            <Heart size={12} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            onClick={onReplyButtonClick}
          >
            <Reply size={12} />
          </Button>

          {threadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={onReplyButtonClick}
            >
              <MessageCircle size={12} />
              <span className="ml-1">{threadCount}</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
          >
            <MoreHorizontal size={12} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
