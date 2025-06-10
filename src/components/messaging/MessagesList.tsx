
import React, { useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';
import MessageItem from './MessageItem';

interface MessagesListProps {
  messages: any[];
  user: any;
  reactions: Record<string, any[]>;
  getThreadCount: (messageId: string) => number;
  onReactionButtonClick: (event: React.MouseEvent, messageId: string) => void;
  onReplyToMessage: (message: any) => void;
  onReactionToggle: (messageId: string, emoji: string) => void;
}

const MessagesList = ({
  messages,
  user,
  reactions,
  getThreadCount,
  onReactionButtonClick,
  onReplyToMessage,
  onReactionToggle
}: MessagesListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <Smile className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p>No messages yet. Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isOwn = message.sender_id === user?.id;
        const messageReactions = reactions[message.id] || [];
        const threadCount = getThreadCount(message.id);

        return (
          <MessageItem
            key={message.id}
            message={message}
            isOwn={isOwn}
            user={user}
            messageReactions={messageReactions}
            threadCount={threadCount}
            onReactionButtonClick={onReactionButtonClick}
            onReplyToMessage={onReplyToMessage}
            onReactionToggle={onReactionToggle}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;
