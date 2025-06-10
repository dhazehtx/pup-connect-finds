
import React from 'react';
import MessagesList from './MessagesList';
import MessageInputArea from './MessageInputArea';
import MessageReactionsPicker from './MessageReactionsPicker';
import MessageThread from './MessageThread';

interface ChatContainerProps {
  messages: any[];
  user: any;
  reactions: Record<string, any[]>;
  getThreadCount: (messageId: string) => number;
  onReactionButtonClick: (event: React.MouseEvent, messageId: string) => void;
  onReplyToMessage: (message: any) => void;
  onReactionToggle: (messageId: string, emoji: string) => void;
  newMessage: string;
  setNewMessage: (message: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  uploading: boolean;
  sendingMessage: boolean;
  onSendMessage: () => void;
  onSendVoiceMessage: (audioBlob: Blob, duration: number) => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (event: React.KeyboardEvent) => void;
  sendMessage: (conversationId: string, content: string, messageType?: string, imageUrl?: string) => Promise<any>;
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
}

const ChatContainer = ({
  messages,
  user,
  reactions,
  getThreadCount,
  onReactionButtonClick,
  onReplyToMessage,
  onReactionToggle,
  newMessage,
  setNewMessage,
  selectedFile,
  setSelectedFile,
  uploading,
  sendingMessage,
  onSendMessage,
  onSendVoiceMessage,
  onFileSelect,
  onKeyPress,
  sendMessage,
  conversationId,
  reactionPickerState,
  onReactionAdd,
  closeReactionPicker,
  threadState,
  closeThread
}: ChatContainerProps) => {
  return (
    <div className="flex flex-col h-full bg-background">
      <MessagesList
        messages={messages}
        user={user}
        reactions={reactions}
        getThreadCount={getThreadCount}
        onReactionButtonClick={onReactionButtonClick}
        onReplyToMessage={onReplyToMessage}
        onReactionToggle={onReactionToggle}
      />

      {/* Thread Dialog */}
      {threadState.parentMessage && (
        <MessageThread
          parentMessageId={threadState.parentMessageId || ''}
          isOpen={threadState.isOpen}
          onClose={closeThread}
          parentMessage={threadState.parentMessage}
        />
      )}

      {/* Reaction Picker */}
      <MessageReactionsPicker
        messageId={reactionPickerState.messageId || ''}
        onReactionAdd={onReactionAdd}
        isOpen={reactionPickerState.isOpen}
        onClose={closeReactionPicker}
        position={reactionPickerState.position || undefined}
      />

      <MessageInputArea
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        uploading={uploading}
        sendingMessage={sendingMessage}
        onSendMessage={onSendMessage}
        onSendVoiceMessage={onSendVoiceMessage}
        onFileSelect={onFileSelect}
        onKeyPress={onKeyPress}
        sendMessage={sendMessage}
        conversationId={conversationId}
      />
    </div>
  );
};

export default ChatContainer;
