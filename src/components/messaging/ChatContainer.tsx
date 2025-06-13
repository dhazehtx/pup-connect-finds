
import React from 'react';
import { Card } from '@/components/ui/card';
import ChatHeader from './ChatHeader';
import MessagesList from './MessagesList';
import EnhancedMessageInput from './EnhancedMessageInput';
import EmojiPicker from './EmojiPicker';
import MessageThread from './MessageThread';
import { Message } from '@/types/chat';

interface ChatContainerProps {
  messages: any[];
  user: any;
  reactions: any;
  getThreadCount: (messageId: string) => number;
  onReactionButtonClick: (event: React.MouseEvent, messageId: string) => void;
  onReplyToMessage: (message: any) => void;
  onReactionToggle: (messageId: string, emoji: string) => void;
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
  onSendVoiceMessage: (audioUrl: string, duration: number) => Promise<void>;
  onBack: () => void;
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
  const handleSendMessage = async (content: string, messageType = 'text', options: any = {}) => {
    await sendMessage(conversationId, content, messageType, options.imageUrl);
  };

  const handleFileSelect = async (file: File) => {
    // Mock file handling for now
    const fileName = file.name;
    const fileType = file.type.startsWith('image/') ? 'image' : 'file';
    await handleSendMessage(`Shared ${fileType}: ${fileName}`, fileType);
  };

  // Convert messages to the Message type expected by MessagesList
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
    <div className="h-full flex flex-col">
      <ChatHeader
        onBack={onBack}
        otherUser={{ id: 'other', name: 'User', avatar: undefined }}
        otherUserTyping={false}
        isUserOnline={true}
      />

      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <MessagesList
            messages={typedMessages}
            user={user}
            reactions={reactions}
            getThreadCount={getThreadCount}
            onReactionButtonClick={onReactionButtonClick}
            onReplyToMessage={onReplyToMessage}
            onReactionToggle={onReactionToggle}
            conversationId={conversationId}
          />

          <EnhancedMessageInput
            conversationId={conversationId}
            onSendMessage={handleSendMessage}
            onSendVoiceMessage={onSendVoiceMessage}
            onFileSelect={handleFileSelect}
            placeholder="Type your message..."
          />
        </div>

        {threadState.isOpen && threadState.parentMessage && (
          <div className="w-96 border-l bg-background">
            <MessageThread
              parentMessage={threadState.parentMessage}
              onClose={closeThread}
              conversationId={conversationId}
            />
          </div>
        )}
      </div>

      {reactionPickerState.isOpen && reactionPickerState.position && (
        <div 
          className="fixed z-50"
          style={{
            left: reactionPickerState.position.x,
            top: reactionPickerState.position.y - 60
          }}
        >
          <EmojiPicker
            onEmojiSelect={(emoji) => {
              if (reactionPickerState.messageId) {
                onReactionAdd(reactionPickerState.messageId, emoji);
              }
            }}
            onClose={closeReactionPicker}
          />
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
