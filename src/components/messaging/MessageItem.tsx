
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Smile, MessageSquare, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
}

const MessageItem = ({
  message,
  isOwn,
  user,
  messageReactions,
  threadCount,
  onReactionButtonClick,
  onReplyToMessage,
  onReactionToggle
}: MessageItemProps) => {
  const messageTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'} group`}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src="/placeholder.svg" />
        <AvatarFallback className="text-xs">
          {isOwn ? 'Me' : 'U'}
        </AvatarFallback>
      </Avatar>

      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'text-right' : 'text-left'}`}>
        <div className="relative">
          <div
            className={`rounded-lg px-3 py-2 ${
              isOwn
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {message.message_type === 'image' && message.image_url && (
              <img
                src={message.image_url}
                alt="Shared image"
                className="rounded mb-2 max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.image_url, '_blank')}
                onError={(e) => {
                  console.log('Image failed to load:', message.image_url);
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            {message.message_type === 'voice' && message.image_url && (
              <div className="flex items-center gap-2 mb-2">
                <audio 
                  controls 
                  src={message.image_url}
                  className="max-w-full"
                  onError={(e) => {
                    console.log('Audio failed to load:', message.image_url);
                  }}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            {message.content && (
              <p className="text-sm break-words">{message.content}</p>
            )}
          </div>

          {/* Message Actions - shown on hover */}
          <div className={`absolute top-0 ${isOwn ? 'left-0' : 'right-0'} transform ${isOwn ? '-translate-x-full' : 'translate-x-full'} opacity-0 group-hover:opacity-100 transition-opacity`}>
            <div className="flex items-center gap-1 bg-background border rounded-md shadow-sm p-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => onReactionButtonClick(e, message.id)}
              >
                <Smile className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onReplyToMessage(message)}
                title="Reply in thread"
              >
                <MessageSquare className="w-3 h-3" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onReplyToMessage(message)}>
                    Reply in thread
                  </DropdownMenuItem>
                  <DropdownMenuItem>Forward</DropdownMenuItem>
                  {isOwn && <DropdownMenuItem>Edit</DropdownMenuItem>}
                  <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Thread indicator */}
        {threadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className={`mt-1 h-6 text-xs ${isOwn ? 'ml-auto' : 'mr-auto'} flex items-center gap-1`}
            onClick={() => onReplyToMessage(message)}
          >
            <MessageSquare className="w-3 h-3" />
            {threadCount} {threadCount === 1 ? 'reply' : 'replies'}
          </Button>
        )}

        {/* Message Reactions */}
        {messageReactions.length > 0 && (
          <MessageReactionsDisplay
            reactions={messageReactions}
            currentUserId={user.id}
            onReactionToggle={(emoji) => onReactionToggle(message.id, emoji)}
            className={isOwn ? 'justify-end' : 'justify-start'}
          />
        )}
        
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-muted-foreground">{messageTime}</span>
          {isOwn && (
            <MessageStatusIndicator 
              status={message.read_at ? 'read' : 'delivered'} 
              size={12}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
