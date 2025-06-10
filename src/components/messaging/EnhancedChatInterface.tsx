
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

  console.log('EnhancedChatInterface loaded for conversation:', conversationId);
  console.log('Current messages:', messages);
  console.log('User:', user?.id);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId && user) {
      console.log('Loading messages for conversation:', conversationId);
      fetchMessages(conversationId).then(() => {
        console.log('Messages loaded successfully');
        markAsRead(conversationId);
      }).catch(error => {
        console.error('Failed to load messages:', error);
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
    await handleSendMessage(newMessage, selectedFile, setSendingMessage, clearInputs);
  };

  // Handle file selection
  const onFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = handleFileSelect(event);
    if (file) {
      setSelectedFile(file);
    }
  };

  // Handle key press
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSendMessage();
    }
  };

  const handleReactionAdd = (messageId: string, emoji: string) => {
    addReaction(messageId, emoji);
    closeReactionPicker();
  };

  const handleReactionToggle = (messageId: string, emoji: string) => {
    toggleReaction(messageId, emoji);
  };

  const onReplyToMessage = (message: any) => {
    handleReplyToMessage(message, user);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Please sign in to access messages</p>
      </div>
    );
  }

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
      onSendVoiceMessage={handleSendVoiceMessage}
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
