
import React, { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';

interface MessagesListProps {
  messages: any[];
  user: any;
  reactions: Record<string, any[]>;
  getThreadCount: (messageId: string) => number;
  onReactionButtonClick: (event: React.MouseEvent, messageId: string) => void;
  onReplyToMessage: (message: any) => void;
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isOwn={message.sender_id === user?.id}
          user={user}
          messageReactions={reactions[message.id] || []}
          threadCount={getThreadCount(message.id)}
          onReactionButtonClick={onReactionButtonClick}
          onReplyToMessage={onReplyToMessage}
          onReactionToggle={onReactionToggle}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;
