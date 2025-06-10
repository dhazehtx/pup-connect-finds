
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useEnhancedFileUpload } from '@/hooks/useEnhancedFileUpload';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useMessageThreads } from '@/hooks/useMessageThreads';
import { useChatState } from '@/hooks/useChatState';
import { useChatHandlers } from '@/hooks/useChatHandlers';
import ChatContainer from './ChatContainer';

interface EnhancedChatInterfaceProps {
  conversationId: string;
  otherUserId: string;
  listingId?: string;
}

const EnhancedChatInterface = ({ conversationId, otherUserId, listingId }: EnhancedChatInterfaceProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { messages, fetchMessages, sendMessage, markAsRead } = useRealtimeMessages();
  const { uploading } = useEnhancedFileUpload();
  const { reactions, addReaction, toggleReaction } = useMessageReactions();
  const { getThreadCount } = useMessageThreads();
  
  const {
    newMessage,
    setNewMessage,
    selectedFile,
    setSelectedFile,
    sendingMessage,
    setSendingMessage,
    reactionPickerState,
    threadState,
    clearInputs,
    handleReactionButtonClick,
    closeReactionPicker,
    handleReplyToMessage,
    closeThread
  } = useChatState();

  const {
    handleSendMessage,
    handleFileSelect,
    handleSendVoiceMessage
  } = useChatHandlers({ user, conversationId, sendMessage });

  console.log('💬 EnhancedChatInterface - Component rendered with props:', {
    conversationId,
    otherUserId,
    listingId,
    userId: user?.id,
    messageCount: messages.length
  });

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId && user) {
      console.log('📥 EnhancedChatInterface - Loading messages for conversation:', conversationId);
      fetchMessages(conversationId).then(() => {
        console.log('✅ EnhancedChatInterface - Messages loaded successfully, count:', messages.length);
        markAsRead(conversationId);
      }).catch(error => {
        console.error('❌ EnhancedChatInterface - Failed to load messages:', error);
        toast({
          title: "Error loading messages",
          description: "Please refresh and try again",
          variant: "destructive",
        });
      });
    }
  }, [conversationId, user, fetchMessages, markAsRead, toast]);

  // Handle sending message
  const onSendMessage = async () => {
    console.log('📤 EnhancedChatInterface - Send message triggered');
    await handleSendMessage(newMessage, selectedFile, setSendingMessage, clearInputs);
  };

  // Handle file selection
  const onFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 EnhancedChatInterface - File select triggered');
    const file = handleFileSelect(event);
    if (file) {
      console.log('✅ EnhancedChatInterface - File selected successfully:', file.name);
      setSelectedFile(file);
    }
  };

  // Handle key press
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      console.log('⌨️ EnhancedChatInterface - Enter key pressed, sending message');
      event.preventDefault();
      onSendMessage();
    }
  };

  const handleReactionAdd = (messageId: string, emoji: string) => {
    console.log('😊 EnhancedChatInterface - Adding reaction:', { messageId, emoji });
    addReaction(messageId, emoji);
    closeReactionPicker();
  };

  const handleReactionToggle = (messageId: string, emoji: string) => {
    console.log('🔄 EnhancedChatInterface - Toggling reaction:', { messageId, emoji });
    toggleReaction(messageId, emoji);
  };

  const onReplyToMessage = (message: any) => {
    console.log('💬 EnhancedChatInterface - Reply to message triggered:', message.id);
    handleReplyToMessage(message, user);
  };

  // Handle voice message - updated to match expected interface
  const onSendVoiceMessage = (audioUrl: string, duration: number) => {
    console.log('🎤 EnhancedChatInterface - Voice message triggered:', { audioUrl, duration });
    handleSendVoiceMessage(audioUrl, duration);
  };

  if (!user) {
    console.log('❌ EnhancedChatInterface - No user found, showing sign-in prompt');
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Please sign in to access messages</p>
      </div>
    );
  }

  console.log('🎯 EnhancedChatInterface - Rendering ChatContainer with:', {
    messageCount: messages.length,
    reactionCount: Object.keys(reactions).length,
    isUploading: uploading,
    isSending: sendingMessage
  });

  return (
    <ChatContainer
      messages={messages}
      user={user}
      reactions={reactions}
      getThreadCount={getThreadCount}
      onReactionButtonClick={handleReactionButtonClick}
      onReplyToMessage={onReplyToMessage}
      onReactionToggle={handleReactionToggle}
      newMessage={newMessage}
      setNewMessage={setNewMessage}
      selectedFile={selectedFile}
      setSelectedFile={setSelectedFile}
      uploading={uploading}
      sendingMessage={sendingMessage}
      onSendMessage={onSendMessage}
      onSendVoiceMessage={onSendVoiceMessage}
      onFileSelect={onFileSelect}
      onKeyPress={handleKeyPress}
      sendMessage={sendMessage}
      conversationId={conversationId}
      reactionPickerState={reactionPickerState}
      onReactionAdd={handleReactionAdd}
      closeReactionPicker={closeReactionPicker}
      threadState={threadState}
      closeThread={closeThread}
    />
  );
};

export default EnhancedChatInterface;
