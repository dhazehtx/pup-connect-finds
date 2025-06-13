import React, { useState, useEffect } from 'react';
import { useRealtimeConversations } from '@/hooks/useRealtimeConversations';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useAuth } from '@/contexts/AuthContext';
import ConversationList from './ConversationList';
import ChatContainer from './ChatContainer';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useMessageThreads } from '@/hooks/useMessageThreads';
import { ExtendedConversation } from '@/types/messaging';

const OptimizedMessagingInterface = () => {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showConversationList, setShowConversationList] = useState(true);

  const { conversations, loading } = useRealtimeConversations();
  const { messages, fetchMessages, sendMessage, markAsRead } = useRealtimeMessages();
  const { reactions, addReaction, toggleReaction } = useMessageReactions();
  const { getThreadCount } = useMessageThreads();

  const [reactionPickerState, setReactionPickerState] = useState<{
    isOpen: boolean;
    messageId: string | null;
    position: { x: number; y: number } | null;
  }>({
    isOpen: false,
    messageId: null,
    position: null
  });

  const [threadState, setThreadState] = useState<{
    isOpen: boolean;
    parentMessageId: string | null;
    parentMessage: any | null;
  }>({
    isOpen: false,
    parentMessageId: null,
    parentMessage: null
  });

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
      markAsRead(selectedConversationId);
    }
  }, [selectedConversationId]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowConversationList(false);
  };

  const handleReactionButtonClick = (event: React.MouseEvent, messageId: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setReactionPickerState({
      isOpen: true,
      messageId,
      position: { x: rect.left, y: rect.top }
    });
  };

  const handleReplyToMessage = (message: any) => {
    setThreadState({
      isOpen: true,
      parentMessageId: message.id,
      parentMessage: message
    });
  };

  const handleReactionAdd = (messageId: string, emoji: string) => {
    addReaction(messageId, emoji);
    setReactionPickerState({ isOpen: false, messageId: null, position: null });
  };

  const closeReactionPicker = () => {
    setReactionPickerState({ isOpen: false, messageId: null, position: null });
  };

  const closeThread = () => {
    setThreadState({ isOpen: false, parentMessageId: null, parentMessage: null });
  };

  const handleSendVoiceMessage = (audioUrl: string, duration: number) => {
    if (selectedConversationId) {
      sendMessage(selectedConversationId, `Voice message (${duration}s)`, 'voice', audioUrl);
    }
  };

  const handleBack = () => {
    setShowConversationList(true);
    setSelectedConversationId(null);
  };

  // Convert ExtendedConversation to Conversation format for ConversationList
  const conversationsForList = conversations.map((conv: ExtendedConversation) => ({
    id: conv.id,
    listing_id: conv.listing_id || null,
    buyer_id: conv.buyer_id,
    seller_id: conv.seller_id,
    created_at: conv.created_at,
    updated_at: conv.updated_at,
    last_message_at: conv.last_message_at || null,
    listing: conv.listing ? {
      dog_name: conv.listing.dog_name,
      breed: conv.listing.breed || '',
      image_url: conv.listing.image_url || null
    } : undefined,
    other_user: conv.other_user ? {
      id: conv.other_user.id,
      full_name: conv.other_user.full_name || null,
      username: conv.other_user.username || null,
      avatar_url: conv.other_user.avatar_url || null
    } : undefined,
    unread_count: conv.unread_count
  }));

  if (showConversationList || !selectedConversationId) {
    return (
      <div className="h-screen bg-background">
        <ConversationList
          conversations={conversationsForList}
          selectedConversationId={selectedConversationId || ''}
          onSelectConversation={handleSelectConversation}
          loading={loading}
        />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background">
      <ChatContainer
        messages={messages}
        user={user}
        reactions={reactions}
        getThreadCount={getThreadCount}
        onReactionButtonClick={handleReactionButtonClick}
        onReplyToMessage={handleReplyToMessage}
        onReactionToggle={toggleReaction}
        sendMessage={sendMessage}
        conversationId={selectedConversationId}
        reactionPickerState={reactionPickerState}
        onReactionAdd={handleReactionAdd}
        closeReactionPicker={closeReactionPicker}
        threadState={threadState}
        closeThread={closeThread}
        onSendVoiceMessage={handleSendVoiceMessage}
        onBack={handleBack}
      />
    </div>
  );
};

export default OptimizedMessagingInterface;
