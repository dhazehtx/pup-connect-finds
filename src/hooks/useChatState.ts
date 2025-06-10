
import { useState } from 'react';

export const useChatState = () => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
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

  console.log('🔄 useChatState - Current state:', {
    newMessage: newMessage.substring(0, 50) + (newMessage.length > 50 ? '...' : ''),
    hasSelectedFile: !!selectedFile,
    sendingMessage,
    reactionPickerOpen: reactionPickerState.isOpen,
    threadOpen: threadState.isOpen
  });

  const clearInputs = () => {
    console.log('🧹 useChatState - Clearing inputs');
    setNewMessage('');
    setSelectedFile(null);
  };

  const handleReactionButtonClick = (event: React.MouseEvent, messageId: string) => {
    event.preventDefault();
    console.log('😊 useChatState - Reaction button clicked for message:', messageId);
    const rect = event.currentTarget.getBoundingClientRect();
    setReactionPickerState({
      isOpen: true,
      messageId,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top
      }
    });
    console.log('😊 useChatState - Reaction picker positioned at:', { x: rect.left + rect.width / 2, y: rect.top });
  };

  const closeReactionPicker = () => {
    console.log('❌ useChatState - Closing reaction picker');
    setReactionPickerState({ isOpen: false, messageId: null, position: null });
  };

  const handleReplyToMessage = (message: any, user: any) => {
    console.log('💬 useChatState - Replying to message:', {
      messageId: message.id,
      messageContent: message.content?.substring(0, 50),
      userId: user?.id
    });
    setThreadState({
      isOpen: true,
      parentMessageId: message.id,
      parentMessage: {
        content: message.content,
        sender_name: message.sender_id === user?.id ? 'You' : 'User',
        created_at: message.created_at,
        sender_id: message.sender_id
      }
    });
  };

  const closeThread = () => {
    console.log('❌ useChatState - Closing thread');
    setThreadState({
      isOpen: false,
      parentMessageId: null,
      parentMessage: null
    });
  };

  return {
    newMessage,
    setNewMessage: (message: string) => {
      console.log('📝 useChatState - Setting new message:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));
      setNewMessage(message);
    },
    selectedFile,
    setSelectedFile: (file: File | null) => {
      console.log('📎 useChatState - Setting selected file:', file ? `${file.name} (${file.size} bytes)` : 'null');
      setSelectedFile(file);
    },
    sendingMessage,
    setSendingMessage: (sending: boolean) => {
      console.log('⏳ useChatState - Setting sending message:', sending);
      setSendingMessage(sending);
    },
    reactionPickerState,
    threadState,
    clearInputs,
    handleReactionButtonClick,
    closeReactionPicker,
    handleReplyToMessage,
    closeThread
  };
};
