
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import ChatContainer from './ChatContainer';
import RealtimeChat from './RealtimeChat';
import MessageTypingIndicator from './MessageTypingIndicator';
import { useMessagingRefactored } from '@/hooks/messaging/useMessagingRefactored';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useMessageThreads } from '@/hooks/useMessageThreads';
import { usePresenceManager } from '@/hooks/usePresenceManager';
import { useChatState } from '@/hooks/useChatState';
import { useChatHandlers } from '@/hooks/useChatHandlers';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface LiveChatInterfaceProps {
  conversationId: string;
  otherUserId: string;
  onBack: () => void;
}

const LiveChatInterface = ({ conversationId, otherUserId, onBack }: LiveChatInterfaceProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [otherUserInfo, setOtherUserInfo] = useState<any>(null);

  const { messages, sendMessage, fetchMessages } = useMessagingRefactored();
  const { reactions, toggleReaction, addReaction } = useMessageReactions();
  const { getThreadCount, sendThreadReply } = useMessageThreads();
  const { 
    setupConversationPresence, 
    sendTypingIndicator, 
    isUserOnline,
    getTypingUsers 
  } = usePresenceManager();

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
  } = useChatHandlers({
    user,
    conversationId,
    sendMessage
  });

  // Set up presence for this conversation
  useEffect(() => {
    if (conversationId && user) {
      const cleanup = setupConversationPresence(conversationId);
      return cleanup;
    }
  }, [conversationId, user, setupConversationPresence]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId, fetchMessages]);

  // Set up typing indicator
  const typingIndicator = MessageTypingIndicator({
    conversationId,
    currentUserId: user?.id || '',
    onTyping: (isTyping) => {
      // Handle typing state changes if needed
    }
  });

  const onSendMessage = () => {
    handleSendMessage(newMessage, selectedFile, setSendingMessage, clearInputs);
  };

  const onKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSendMessage();
    }
    
    // Start typing indicator
    if (newMessage.length === 0) {
      typingIndicator.onTypingStart();
    }
  };

  const onReactionAdd = (messageId: string, emoji: string) => {
    addReaction(messageId, emoji);
    closeReactionPicker();
  };

  const onReplyToMessage = (message: any) => {
    handleReplyToMessage(message, user);
  };

  const isOnline = isUserOnline(otherUserId);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherUserInfo?.avatar_url || ''} />
              <AvatarFallback>
                {otherUserInfo?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm">
              {otherUserInfo?.full_name || 'User'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isOnline ? 'Online' : 'Last seen recently'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Phone size={20} />
          </Button>
          <Button variant="ghost" size="icon">
            <Video size={20} />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical size={20} />
          </Button>
        </div>
      </div>

      {/* Real-time Chat Wrapper */}
      <RealtimeChat conversationId={conversationId}>
        <ChatContainer
          messages={messages}
          user={user}
          reactions={reactions}
          getThreadCount={getThreadCount}
          onReactionButtonClick={handleReactionButtonClick}
          onReplyToMessage={onReplyToMessage}
          onReactionToggle={toggleReaction}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          uploading={uploading}
          sendingMessage={sendingMessage}
          onSendMessage={onSendMessage}
          onSendVoiceMessage={handleSendVoiceMessage}
          onFileSelect={handleFileSelect}
          onKeyPress={onKeyPress}
          sendMessage={sendMessage}
          conversationId={conversationId}
          reactionPickerState={reactionPickerState}
          onReactionAdd={onReactionAdd}
          closeReactionPicker={closeReactionPicker}
          threadState={threadState}
          closeThread={closeThread}
        />
      </RealtimeChat>

      {/* Typing Indicator */}
      {typingIndicator.typingIndicator}
    </div>
  );
};

export default LiveChatInterface;
