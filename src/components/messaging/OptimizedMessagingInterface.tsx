
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeMessaging } from '@/hooks/useRealtimeMessaging';
import { useRealtime } from '@/contexts/RealtimeContext';
import ConversationList from './ConversationList';
import ChatContainer from './ChatContainer';
import MessagingStatusIndicator from './MessagingStatusIndicator';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useMessageThreads } from '@/hooks/useMessageThreads';
import { ExtendedConversation } from '@/types/messaging';

const OptimizedMessagingInterface = () => {
  const { user } = useAuth();
  const { onlineUsers, isConnected } = useRealtime();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showConversationList, setShowConversationList] = useState(true);

  const { 
    conversations, 
    messages, 
    loading,
    fetchMessages, 
    sendMessage, 
    markAsRead,
    subscribeToConversation
  } = useRealtimeMessaging();

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

  // Subscribe to real-time updates when conversation is selected
  useEffect(() => {
    if (selectedConversationId && isConnected) {
      fetchMessages(selectedConversationId);
      markAsRead(selectedConversationId);
      
      // Set up real-time subscription
      const unsubscribe = subscribeToConversation(selectedConversationId);
      return unsubscribe;
    }
  }, [selectedConversationId, isConnected, fetchMessages, markAsRead, subscribeToConversation]);

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

  const handleSendVoiceMessage = async (audioUrl: string, duration: number): Promise<void> => {
    if (selectedConversationId) {
      await sendMessage(selectedConversationId, `Voice message (${duration}s)`, 'voice', audioUrl);
    }
  };

  const handleBack = () => {
    setShowConversationList(true);
    setSelectedConversationId(null);
  };

  // Convert conversations to the format expected by ConversationList
  const conversationsForList = conversations.map((conv) => ({
    id: conv.id,
    listing_id: conv.listing_id || null,
    buyer_id: conv.buyer_id,
    seller_id: conv.seller_id,
    created_at: conv.created_at,
    updated_at: conv.updated_at,
    last_message_at: conv.last_message_at || null,
    listing: undefined,
    other_user: undefined,
    unread_count: 0
  }));

  if (showConversationList || !selectedConversationId) {
    return (
      <div className="h-screen bg-background">
        <div className="p-4 border-b">
          <MessagingStatusIndicator />
          {!isConnected && (
            <p className="text-sm text-muted-foreground mt-2">
              Attempting to connect to real-time messaging...
            </p>
          )}
        </div>
        
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
