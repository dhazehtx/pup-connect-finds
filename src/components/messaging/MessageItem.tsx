
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Smile, Reply, MoreHorizontal, User } from 'lucide-react';
import MessageStatusIndicator from './MessageStatusIndicator';
import ThreadIndicator from './ThreadIndicator';
import SearchResultHighlight from './SearchResultHighlight';

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
  searchQuery?: string;
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
  onDeleteMessage,
  searchQuery = ''
}: MessageItemProps) => {
  const messageTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  const getMessageStatus = () => {
    if (!isOwn) return null;
    return message.read_at ? 'read' : 'delivered';
  };

  const handleViewThread = () => {
    onReplyToMessage(message);
  };

  const renderReactions = () => {
    if (messageReactions.length === 0) return null;

    // Group reactions by emoji with proper typing
    const groupedReactions = messageReactions.reduce((acc: Record<string, { count: number; userReacted: boolean }>, reaction: any) => {
      const emoji = reaction.emoji;
      if (!acc[emoji]) {
        acc[emoji] = { count: 0, userReacted: false };
      }
      acc[emoji].count++;
      if (reaction.user_id === user?.id) {
        acc[emoji].userReacted = true;
      }
      return acc;
    }, {});

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {Object.entries(groupedReactions).map(([emoji, data]) => (
          <Button
            key={emoji}
            variant={data.userReacted ? "default" : "outline"}
            size="sm"
            onClick={() => onReactionToggle(message.id, emoji)}
            className="h-6 px-2 text-xs"
          >
            <span className="mr-1">{emoji}</span>
            {data.count}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={isOwn ? user?.user_metadata?.avatar_url : '/placeholder.svg'} />
        <AvatarFallback className="text-xs">
          {isOwn ? 'Me' : <User className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'text-right' : 'text-left'}`}>
        {/* Main Message */}
        <div
          className={`rounded-lg px-3 py-2 relative group ${
            isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {/* Message Actions */}
          <div className={`absolute top-1 ${isOwn ? 'left-1' : 'right-1'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => onReactionButtonClick(e, message.id)}
              className="h-6 w-6 p-0 hover:bg-background/20"
            >
              <Smile className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReplyToMessage(message)}
              className="h-6 w-6 p-0 hover:bg-background/20"
            >
              <Reply className="w-3 h-3" />
            </Button>
            {isOwn && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-background/20"
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            )}
          </div>

          {/* Media Content */}
          {message.message_type === 'image' && message.image_url && (
            <img
              src={message.image_url}
              alt="Shared image"
              className="rounded mb-2 max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.image_url, '_blank')}
            />
          )}

          {message.message_type === 'voice' && message.image_url && (
            <div className="mb-2">
              <audio controls className="w-full max-w-xs">
                <source src={message.image_url} type="audio/webm" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Text Content with Search Highlighting */}
          {message.content && (
            <SearchResultHighlight
              text={message.content}
              searchQuery={searchQuery}
              className="text-sm break-words"
            />
          )}

          {/* Encryption Indicator */}
          {message.is_encrypted && (
            <div className="absolute bottom-1 right-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" title="Encrypted" />
            </div>
          )}
        </div>

        {/* Reactions */}
        {renderReactions()}

        {/* Thread Indicator */}
        <ThreadIndicator
          threadCount={threadCount}
          onViewThread={handleViewThread}
          compact={true}
        />

        {/* Message Footer */}
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-muted-foreground">{messageTime}</span>
          {isOwn && (
            <MessageStatusIndicator 
              status={getMessageStatus() || 'sent'} 
              size={12}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
