
import React, { useEffect } from 'react';
import MessagesList from './MessagesList';
import EnhancedMessageInput from './EnhancedMessageInput';
import MessageThread from './MessageThread';
import MessageReactionsPicker from './MessageReactionsPicker';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useTypingIndicators } from '@/hooks/useTypingIndicators';

interface ChatContainerProps {
  messages: any[];
  user: any;
  reactions: Record<string, any[]>;
  getThreadCount: (messageId: string) => number;
  onReactionButtonClick: (event: React.MouseEvent, messageId: string) => void;
  onReplyToMessage: (message: any) => void;
  onReactionToggle: (messageId: string, emoji: string) => void;
  sendMessage: (conversationId: string, content: string, type?: string, fileUrl?: string) => Promise<any>;
  conversationId: string;
  reactionPickerState: {
    isOpen: boolean;
    messageId: string | null;
    position: { x: number; y: number } | null;
  };
  onReactionAdd: (messageId: string, emoji: string) => void;
  closeReactionPicker: () => void;
  threadState: {
    isOpen: boolean;
    parentMessageId: string | null;
    parentMessage: any | null;
  };
  closeThread: () => void;
  onSendVoiceMessage: (audioUrl: string, duration: number) => Promise<void>;
  onBack?: () => void;
}

const ChatContainer = ({
  messages,
  user,
  reactions,
  getThreadCount,
  onReactionButtonClick,
  onReplyToMessage,
  onReactionToggle,
  sendMessage,
  conversationId,
  reactionPickerState,
  onReactionAdd,
  closeReactionPicker,
  threadState,
  closeThread,
  onSendVoiceMessage,
  onBack
}: ChatContainerProps) => {
  const { fetchReactions } = useMessageReactions();
  const { getTypingUsers } = useTypingIndicators();

  useEffect(() => {
    if (messages.length > 0) {
      const messageIds = messages.map(m => m.id);
      messageIds.forEach(id => fetchReactions(id));
    }
  }, [messages, fetchReactions]);

  const typingUsers = getTypingUsers(conversationId);

  const handleSendMessage = async (content: string, type = 'text', options?: any) => {
    await sendMessage(conversationId, content, type, options?.imageUrl || options?.fileUrl);
  };

  const handleSendVoiceMessage = async (audioUrl: string, duration: number): Promise<void> => {
    await onSendVoiceMessage(audioUrl, duration);
  };

  const handleFileSelect = async (file: File): Promise<void> => {
    console.log('File selected:', file.name);
    // Implementation for file handling
  };

  return (
    <div className="flex flex-col h-full">
      <MessagesList
        messages={messages}
        user={user}
        reactions={reactions}
        getThreadCount={getThreadCount}
        onReactionButtonClick={onReactionButtonClick}
        onReplyToMessage={onReplyToMessage}
        onReactionToggle={onReactionToggle}
        conversationId={conversationId}
      />

      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-muted-foreground">
          {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      <EnhancedMessageInput
        conversationId={conversationId}
        onSendMessage={handleSendMessage}
        onSendVoiceMessage={handleSendVoiceMessage}
        onFileSelect={handleFileSelect}
        placeholder="Type a message..."
      />

      {reactionPickerState.isOpen && reactionPickerState.messageId && (
        <MessageReactionsPicker
          messageId={reactionPickerState.messageId}
          onReactionAdd={onReactionAdd}
          isOpen={reactionPickerState.isOpen}
          onClose={closeReactionPicker}
          position={reactionPickerState.position || undefined}
        />
      )}

      {threadState.isOpen && threadState.parentMessageId && (
        <MessageThread
          parentMessageId={threadState.parentMessageId}
          isOpen={threadState.isOpen}
          onClose={closeThread}
          parentMessage={threadState.parentMessage}
        />
      )}
    </div>
  );
};

export default ChatContainer;
