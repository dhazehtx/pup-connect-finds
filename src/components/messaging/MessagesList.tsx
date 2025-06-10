
import React, { useRef, useEffect, useState } from 'react';
import { Smile } from 'lucide-react';
import VirtualizedMessagesList from './VirtualizedMessagesList';
import AdvancedMessageSearch from './AdvancedMessageSearch';
import EnhancedTypingIndicator from './EnhancedTypingIndicator';

interface MessagesListProps {
  messages: any[];
  user: any;
  reactions: Record<string, any[]>;
  getThreadCount: (messageId: string) => number;
  onReactionButtonClick: (event: React.MouseEvent, messageId: string) => void;
  onReplyToMessage: (message: any) => void;
  onReactionToggle: (messageId: string, emoji: string) => void;
  conversationId?: string;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

const MessagesList = ({
  messages,
  user,
  reactions,
  getThreadCount,
  onReactionButtonClick,
  onReplyToMessage,
  onReactionToggle,
  conversationId,
  onEditMessage = () => {},
  onDeleteMessage = () => {}
}: MessagesListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(400);
  const [filteredMessages, setFilteredMessages] = useState(messages);
  const [isSearchActive, setIsSearchActive] = useState(false);

  console.log('📋 MessagesList - Rendering with:', {
    totalMessages: messages.length,
    filteredMessages: filteredMessages.length,
    isSearchActive,
    containerHeight
  });

  // Update filtered messages when original messages change
  useEffect(() => {
    if (!isSearchActive) {
      setFilteredMessages(messages);
    }
  }, [messages, isSearchActive]);

  // Calculate container height
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const availableHeight = window.innerHeight - rect.top - 200; // Leave space for input
        setContainerHeight(Math.max(400, availableHeight));
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const handleSearchResults = (results: any[]) => {
    console.log('🔍 MessagesList - Search results received:', results.length);
    setFilteredMessages(results);
    setIsSearchActive(true);
  };

  const handleClearSearch = () => {
    console.log('🧹 MessagesList - Clearing search');
    setFilteredMessages(messages);
    setIsSearchActive(false);
  };

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
    <div ref={containerRef} className="flex flex-col h-full">
      {/* Advanced search */}
      <AdvancedMessageSearch
        messages={messages}
        onSearchResults={handleSearchResults}
        onClearSearch={handleClearSearch}
      />

      {/* Messages area */}
      <div className="flex-1 relative">
        {filteredMessages.length > 0 ? (
          <VirtualizedMessagesList
            messages={filteredMessages}
            user={user}
            reactions={reactions}
            getThreadCount={getThreadCount}
            onReactionButtonClick={onReactionButtonClick}
            onReplyToMessage={onReplyToMessage}
            onReactionToggle={onReactionToggle}
            onEditMessage={onEditMessage}
            onDeleteMessage={onDeleteMessage}
            height={containerHeight}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <p>No messages found matching your search.</p>
            </div>
          </div>
        )}
      </div>

      {/* Typing indicator */}
      {conversationId && (
        <EnhancedTypingIndicator conversationId={conversationId} />
      )}
    </div>
  );
};

export default MessagesList;
