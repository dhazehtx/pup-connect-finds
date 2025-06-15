
import React, { useRef, useEffect, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { User, Check, CheckCheck } from 'lucide-react';
import { Message } from '@/types/chat';

interface VirtualizedMessagesListProps {
  messages: Message[];
  currentUserId?: string;
  height: number;
  otherUserAvatar?: string;
  currentUserAvatar?: string;
}

const MessageItem = React.memo(({ index, style, data }: any) => {
  const { messages, currentUserId, otherUserAvatar, currentUserAvatar } = data;
  const message = messages[index];
  const isOwn = message.sender_id === currentUserId;
  const messageTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  const getMessageStatusIcon = () => {
    if (!isOwn) return null;
    
    if (message.read_at) {
      return <CheckCheck size={14} className="text-blue-500" />;
    }
    return <Check size={14} className="text-gray-400" />;
  };

  return (
    <div style={style} className="px-4 py-2">
      <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={isOwn ? currentUserAvatar : otherUserAvatar} />
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>

        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'text-right' : 'text-left'}`}>
          {/* Image Messages */}
          {(message.message_type === 'image' || message.message_type === 'file') && message.image_url && (
            <div className="mb-2">
              <img
                src={message.image_url}
                alt="Shared content"
                className="max-w-full h-auto rounded cursor-pointer hover:opacity-90 transition-opacity"
                loading="lazy"
                onClick={() => window.open(message.image_url, '_blank')}
              />
            </div>
          )}
          
          {/* Text Messages */}
          {message.content && (
            <div
              className={`rounded-lg px-3 py-2 ${
                isOwn
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm break-words">{message.content}</p>
            </div>
          )}
          
          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-gray-500">{messageTime}</span>
            {getMessageStatusIcon()}
          </div>
        </div>
      </div>
    </div>
  );
});

MessageItem.displayName = 'MessageItem';

const VirtualizedMessagesList = ({ 
  messages, 
  currentUserId, 
  height, 
  otherUserAvatar, 
  currentUserAvatar 
}: VirtualizedMessagesListProps) => {
  const listRef = useRef<List>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollToItem(messages.length - 1, 'end');
    }
  }, [messages.length]);

  const itemData = useMemo(() => ({
    messages,
    currentUserId,
    otherUserAvatar,
    currentUserAvatar
  }), [messages, currentUserId, otherUserAvatar, currentUserAvatar]);

  const getItemSize = () => 80; // Base height, can be made dynamic based on content

  return (
    <List
      ref={listRef}
      height={height}
      itemCount={messages.length}
      itemSize={getItemSize}
      itemData={itemData}
      overscanCount={5}
    >
      {MessageItem}
    </List>
  );
};

export default VirtualizedMessagesList;
