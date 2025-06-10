
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import MessageStatusIndicator from './MessageStatusIndicator';
import MessageReactionsDisplay from './MessageReactionsDisplay';

interface MessageItemProps {
  message: any;
  isOwn: boolean;
  user: any;
  messageReactions: any[];
  threadCount: number;
  onReactionButtonClick: (event: React.MouseEvent, messageId: string) => void;
  onReplyToMessage: (message: any) => void;
  onReactionToggle: (messageId: string, emoji: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

const MessageItem = ({
  message,
  isOwn,
  user,
  messageReactions,
  threadCount,
  onReactionButtonClick,
  onReplyToMessage,
  onReactionToggle,
  onEditMessage,
  onDeleteMessage
}: MessageItemProps) => {
  const messageTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  console.log('💬 MessageItem - Rendering message:', {
    messageId: message.id,
    isOwn,
    messageType: message.message_type,
    hasReactions: messageReactions.length > 0,
    threadCount
  });

  return (
    <div className={`flex gap-3 group hover:bg-muted/20 rounded-lg p-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={user?.avatar_url} />
          <AvatarFallback className="text-xs">
            {user?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`flex-1 max-w-xs lg:max-w-md ${isOwn ? 'text-right' : 'text-left'}`}>
        {/* Message Bubble */}
        <div
          className={`rounded-lg px-3 py-2 break-words ${
            isOwn
              ? 'bg-primary text-primary-foreground ml-auto'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {/* Image Message */}
          {message.message_type === 'image' && message.image_url && (
            <div className="mb-2">
              <img
                src={message.image_url}
                alt="Shared image"
                className="rounded max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.image_url, '_blank')}
                loading="lazy"
              />
            </div>
          )}

          {/* Voice Message */}
          {message.message_type === 'voice' && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                🎤
              </div>
              <div className="flex-1">
                <div className="h-1 bg-primary/20 rounded">
                  <div className="h-1 bg-primary rounded" style={{ width: '60%' }}></div>
                </div>
              </div>
              <span className="text-xs opacity-70">0:45</span>
            </div>
          )}

          {/* Text Content */}
          {message.content && (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Message Info */}
        <div className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span>{messageTime}</span>
          
          {/* Status for own messages */}
          {isOwn && (
            <MessageStatusIndicator 
              status={message.read_at ? 'read' : 'delivered'} 
              size={12}
            />
          )}

          {/* Thread Count */}
          {threadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReplyToMessage(message)}
              className="h-5 px-1 text-xs text-primary hover:text-primary/80"
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              {threadCount} {threadCount === 1 ? 'reply' : 'replies'}
            </Button>
          )}

          {/* Quick Actions (visible on hover) */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => onReactionButtonClick(e, message.id)}
              className="h-5 w-5 p-0"
              title="Add reaction"
            >
              😊
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReplyToMessage(message)}
              className="h-5 w-5 p-0"
              title="Reply in thread"
            >
              💬
            </Button>

            {(isOwn || user?.id === message.sender_id) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                  >
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEditMessage && (
                    <DropdownMenuItem onClick={() => onEditMessage(message.id, message.content)}>
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDeleteMessage && (
                    <DropdownMenuItem 
                      onClick={() => onDeleteMessage(message.id)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Reactions Display */}
        {messageReactions.length > 0 && (
          <MessageReactionsDisplay
            reactions={messageReactions}
            currentUserId={user?.id || ''}
            onReactionToggle={(emoji) => onReactionToggle(message.id, emoji)}
            className={isOwn ? 'justify-end' : 'justify-start'}
          />
        )}
      </div>
    </div>
  );
};

export default MessageItem;
