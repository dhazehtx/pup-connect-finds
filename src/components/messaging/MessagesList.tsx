
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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/5">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground text-center">
            No messages yet. Start the conversation!
          </p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isOwn={message.sender_id === user?.id}
              user={user}
              reactions={reactions[message.id] || []}
              threadCount={getThreadCount(message.id)}
              onReactionButtonClick={onReactionButtonClick}
              onReplyButtonClick={() => onReplyToMessage(message)}
              onReactionToggle={onReactionToggle}
              conversationId={conversationId}
            />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessagesList;
