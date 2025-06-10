
import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import MessageStatusIndicator from './MessageStatusIndicator';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  image_url?: string;
  read_at?: string;
  created_at: string;
}

interface VirtualizedMessageListProps {
  messages: Message[];
  currentUserId: string;
  height: number;
}

const MessageItem = ({ index, style, data }: any) => {
  const { messages, currentUserId } = data;
  const message = messages[index];
  const isOwn = message.sender_id === currentUserId;
  const messageTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  const getMessageStatus = () => {
    if (!isOwn) return null;
    return message.read_at ? 'read' : 'delivered';
  };

  return (
    <div style={style} className="px-4 py-2">
      <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback className="text-xs">
            {isOwn ? 'Me' : 'U'}
          </AvatarFallback>
        </Avatar>

        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'text-right' : 'text-left'}`}>
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
              />
            )}
            {message.content && (
              <p className="text-sm break-words">{message.content}</p>
            )}
          </div>
          
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
    </div>
  );
};

const VirtualizedMessageList = ({ messages, currentUserId, height }: VirtualizedMessageListProps) => {
  const itemData = useMemo(() => ({
    messages,
    currentUserId
  }), [messages, currentUserId]);

  return (
    <List
      height={height}
      itemCount={messages.length}
      itemSize={80}
      itemData={itemData}
    >
      {MessageItem}
    </List>
  );
};

export default VirtualizedMessageList;
