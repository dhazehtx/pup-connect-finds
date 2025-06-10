
import React, { useState, useEffect } from 'react';
import { useRealtimeMessaging } from '@/hooks/useRealtimeMessaging';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useAuth } from '@/contexts/AuthContext';
import ConversationList from './ConversationList';
import ConversationHeader from './ConversationHeader';
import ChatHeader from './ChatHeader';
import MessagesList from './MessagesList';
import EnhancedMessageInput from './EnhancedMessageInput';
import MessagingStatusIndicator from './MessagingStatusIndicator';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useMessageThreads } from '@/hooks/useMessageThreads';
import { useFileUpload } from '@/hooks/useFileUpload';

const EnhancedMessagingInterface = () => {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showConversationList, setShowConversationList] = useState(true);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);

  const {
    messages,
    conversations,
    loading,
    fetchMessages,
    sendMessage,
    markAsRead
  } = useRealtimeMessaging();

  const { onlineUsers, isUserOnline } = useUserPresence();
  const { reactions, toggleReaction } = useMessageReactions();
  const { getThreadCount, sendThreadReply } = useMessageThreads();
  const { uploadFile, uploadImage } = useFileUpload();

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
      markAsRead(selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages, markAsRead]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowConversationList(false);
  };

  const handleSendMessage = async (content: string, messageType = 'text', options: any = {}) => {
    if (!selectedConversationId) return;
    await sendMessage(selectedConversationId, content, messageType, options.imageUrl);
  };

  const handleFileSelect = async (file: File) => {
    if (file.type.startsWith('image/')) {
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        await handleSendMessage(`Shared an image: ${file.name}`, 'image', { imageUrl });
      }
    } else {
      const fileUrl = await uploadFile(file);
      if (fileUrl) {
        await handleSendMessage(`Shared a file: ${file.name}`, 'file', { imageUrl: fileUrl });
      }
    }
  };

  const handleVoiceMessage = async (audioUrl: string, duration: number) => {
    await handleSendMessage(`Voice message (${duration}s)`, 'voice', { imageUrl: audioUrl });
  };

  const handleReactionButtonClick = (event: React.MouseEvent, messageId: string) => {
    event.preventDefault();
    setShowReactionPicker(showReactionPicker === messageId ? null : messageId);
  };

  const handleReplyToMessage = (message: any) => {
    console.log('Reply to message:', message.id);
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const otherUser = selectedConversation?.other_user;

  if (showConversationList || !selectedConversationId) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <ConversationHeader
          onBack={() => setShowConversationList(true)}
          otherUser={null}
          isUserOnline={false}
          activeConversations={onlineUsers.length}
        />

        <div className="p-4">
          <MessagingStatusIndicator />
        </div>

        <div className="flex-1 overflow-hidden">
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId || ''}
            onSelectConversation={handleSelectConversation}
            loading={loading}
          />
        </div>
      </div>
    );
  }

  const otherUserId = selectedConversation?.seller_id === user?.id 
    ? selectedConversation?.buyer_id 
    : selectedConversation?.seller_id || '';

  return (
    <div className="h-screen flex flex-col bg-background">
      <ChatHeader
        onBack={() => setShowConversationList(true)}
        otherUser={otherUser}
        isUserOnline={isUserOnline(otherUserId)}
        selectedConversation={selectedConversation}
      />

      <MessagesList
        messages={messages}
        user={user}
        reactions={reactions}
        getThreadCount={getThreadCount}
        onReactionButtonClick={handleReactionButtonClick}
        onReplyToMessage={handleReplyToMessage}
        onReactionToggle={toggleReaction}
        conversationId={selectedConversationId}
      />

      <EnhancedMessageInput
        onSendMessage={handleSendMessage}
        onSendVoiceMessage={handleVoiceMessage}
        onFileSelect={handleFileSelect}
        placeholder="Type your message..."
      />
    </div>
  );
};

export default EnhancedMessagingInterface;
