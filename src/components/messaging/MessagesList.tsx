
import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  content: string;
  message_type: string;
  image_url?: string;
  voice_url?: string;
  created_at: string;
  sender_id: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
}

interface MessagesListProps {
  messages: Message[];
  user: any;
  reactions: any;
  getThreadCount: (messageId: string) => number;
  onReactionButtonClick: (event: React.MouseEvent, messageId: string) => void;
  onReplyToMessage: (message: Message) => void;
  onReactionToggle: (messageId: string, emoji: string) => void;
  conversationId: string;
}

const MessagesList = ({
  messages,
  user,
  reactions,
  getThreadCount,
  onReactionButtonClick,
  onReplyToMessage,
  onReactionToggle,
  conversationId
}: MessagesListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message, index) => {
          const isOwn = message.sender_id === user?.id;
          const prevMessage = index > 0 ? messages[index - 1] : null;
          const showAvatar = !isOwn && (!prevMessage || prevMessage.sender_id !== message.sender_id);
          
          return (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={isOwn}
              senderName={!isOwn ? "User" : undefined}
              senderAvatar=""
              showAvatar={showAvatar}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default MessagesList;
