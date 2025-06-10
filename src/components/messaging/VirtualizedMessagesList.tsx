
import React, { useEffect, useRef } from 'react';
import { VariableSizeList as List } from 'react-window';
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
  onEditMessage,
  onDeleteMessage,
  height
}: VirtualizedMessagesListProps) => {
  const listRef = useRef<List>(null);
  const itemHeights = useRef<Map<number, number>>(new Map());

  console.log('📜 VirtualizedMessagesList - Rendering:', {
    messageCount: messages.length,
    height,
    cachedHeights: itemHeights.current.size
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollToItem(messages.length - 1, 'end');
    }
  }, [messages.length]);

  // Estimate item height based on message content
  const getItemSize = (index: number) => {
    if (itemHeights.current.has(index)) {
      return itemHeights.current.get(index)!;
    }

    const message = messages[index];
    if (!message) return 80;

    // Base height
    let estimatedHeight = 60;

    // Add height for content
    if (message.content) {
      const contentLines = Math.ceil(message.content.length / 50);
      estimatedHeight += contentLines * 20;
    }

    // Add height for images
    if (message.message_type === 'image') {
      estimatedHeight += 200;
    }

    // Add height for voice messages
    if (message.message_type === 'voice') {
      estimatedHeight += 50;
    }

    // Add height for reactions
    const messageReactions = reactions[message.id] || [];
    if (messageReactions.length > 0) {
      estimatedHeight += 30;
    }

    // Add height for thread indicator
    const threadCount = getThreadCount(message.id);
    if (threadCount > 0) {
      estimatedHeight += 25;
    }

    // Cache the height
    itemHeights.current.set(index, estimatedHeight);
    return estimatedHeight;
  };

  // Update cached height when item is measured
  const setItemHeight = (index: number, height: number) => {
    if (itemHeights.current.get(index) !== height) {
      itemHeights.current.set(index, height);
      // Trigger list re-render to update scroll
      if (listRef.current) {
        listRef.current.resetAfterIndex(index);
      }
    }
  };

  const MessageItemWrapper = ({ index, style }: { index: number; style: any }) => {
    const message = messages[index];
    const isOwn = message.sender_id === user?.id;
    const messageReactions = reactions[message.id] || [];
    const threadCount = getThreadCount(message.id);
    const itemRef = useRef<HTMLDivElement>(null);

    // Measure item height after render
    useEffect(() => {
      if (itemRef.current) {
        const height = itemRef.current.getBoundingClientRect().height;
        setItemHeight(index, height);
      }
    });

    return (
      <div style={style}>
        <div ref={itemRef} className="px-4 py-2">
          <MessageItem
            message={message}
            isOwn={isOwn}
            user={user}
            reactions={messageReactions}
            threadCount={threadCount}
            onReactionButtonClick={onReactionButtonClick}
            onReplyButtonClick={() => onReplyToMessage(message)}
            onReactionToggle={onReactionToggle}
            conversationId={message.conversation_id}
          />
        </div>
      </div>
    );
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>No messages to display</p>
      </div>
    );
  }

  return (
    <List
      ref={listRef}
      height={height}
      itemCount={messages.length}
      itemSize={getItemSize}
      className="scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
    >
      {MessageItemWrapper}
    </List>
  );
};

export default VirtualizedMessagesList;
