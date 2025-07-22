
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
import { Message } from '@/types/chat';

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
    if (!selectedConversationId) return;
    
    try {
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
    } catch (error) {
      console.error('File upload failed:', error);
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

  // Convert basic conversations to the format expected by ConversationList
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

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  
  // Create a simple other user object for the chat header
  const otherUser = selectedConversation ? {
    id: selectedConversation.seller_id === user?.id 
      ? selectedConversation.buyer_id 
      : selectedConversation.seller_id,
    name: 'User',
    avatar: undefined
  } : undefined;

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
            conversations={conversationsForList}
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

  // Filter and type-safe convert messages to match Message interface
  const typedMessages: Message[] = messages.filter((msg): msg is any => {
    const validTypes = ['image', 'text', 'file', 'voice'];
    return (
      typeof msg.id === 'string' &&
      typeof msg.conversation_id === 'string' &&
      typeof msg.sender_id === 'string' &&
      typeof msg.content === 'string' &&
      typeof msg.created_at === 'string' &&
      validTypes.includes(msg.message_type)
    );
  }).map((msg): Message => ({
    id: msg.id,
    conversation_id: msg.conversation_id,
    sender_id: msg.sender_id,
    message_type: msg.message_type as 'image' | 'text' | 'file' | 'voice',
    content: msg.content,
    image_url: msg.image_url,
    voice_url: msg.voice_url,
    file_name: msg.file_name,
    file_size: msg.file_size,
    file_type: msg.file_type,
    created_at: msg.created_at,
    read_at: msg.read_at,
    is_encrypted: msg.is_encrypted
  }));

  return (
    <div className="h-screen flex flex-col bg-background">
      <ChatHeader
        onBack={() => setShowConversationList(true)}
        otherUser={otherUser}
        isUserOnline={isUserOnline(otherUserId)}
        selectedConversation={selectedConversation}
        otherUserTyping={false}
      />

      <MessagesList
        messages={typedMessages}
        user={user}
        reactions={reactions}
        getThreadCount={getThreadCount}
        onReactionButtonClick={handleReactionButtonClick}
        onReplyToMessage={handleReplyToMessage}
        onReactionToggle={toggleReaction}
        conversationId={selectedConversationId}
      />

      <EnhancedMessageInput
        conversationId={selectedConversationId}
        onSendMessage={handleSendMessage}
        onSendVoiceMessage={handleVoiceMessage}
        onFileSelect={handleFileSelect}
        placeholder="Type your message..."
      />
    </div>
  );
};

export default EnhancedMessagingInterface;
