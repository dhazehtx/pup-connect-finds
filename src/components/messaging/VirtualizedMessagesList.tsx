
import React, { useMemo, useRef, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import MessageItem from './MessageItem';

interface VirtualizedMessagesListProps {
  messages: any[];
  user: any;
  reactions: Record<string, any[]>;
  getThreadCount: (messageId: string) => number;
  onReactionButtonClick: (event: React.MouseEvent, messageId: string) => void;
  onReplyToMessage: (message: any) => void;
  onReactionToggle: (messageId: string, emoji: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  height: number;
}

const VirtualizedMessagesList = ({
  messages,
  user,
  reactions,
  getThreadCount,
  onReactionButtonClick,
  onReplyToMessage,
  onReactionToggle,
  onEditMessage = () => {},
  onDeleteMessage = () => {},
  height
}: VirtualizedMessagesListProps) => {
  const listRef = useRef<List>(null);
  
  console.log('🔄 VirtualizedMessagesList - Rendering with:', {
    messageCount: messages.length,
    height,
    userId: user?.id
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollToItem(messages.length - 1, 'end');
    }
  }, [messages.length]);

  // Memoized item data to prevent unnecessary re-renders
  const itemData = useMemo(() => ({
    messages,
    user,
    reactions,
    getThreadCount,
    onReactionButtonClick,
    onReplyToMessage,
    onReactionToggle,
    onEditMessage,
    onDeleteMessage
  }), [messages, user, reactions, getThreadCount, onReactionButtonClick, onReplyToMessage, onReactionToggle, onEditMessage, onDeleteMessage]);

  const Row = ({ index, style }: any) => {
    const message = messages[index];
    const isOwn = message.sender_id === user?.id;
    const messageReactions = reactions[message.id] || [];
    const threadCount = getThreadCount(message.id);

    return (
      <div style={style}>
        <MessageItem
          message={message}
          isOwn={isOwn}
          user={user}
          messageReactions={messageReactions}
          threadCount={threadCount}
          onReactionButtonClick={onReactionButtonClick}
          onReplyToMessage={onReplyToMessage}
          onReactionToggle={onReactionToggle}
          onEditMessage={onEditMessage}
          onDeleteMessage={onDeleteMessage}
        />
      </div>
    );
  };

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p>No messages yet. Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <List
      ref={listRef}
      height={height}
      itemCount={messages.length}
      itemSize={120} // Estimated height per message
      itemData={itemData}
      overscanCount={5} // Render 5 extra items for smoother scrolling
    >
      {Row}
    </List>
  );
};

export default VirtualizedMessagesList;
