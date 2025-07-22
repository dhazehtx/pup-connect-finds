
import { useState } from 'react';

interface ReactionPickerState {
  isOpen: boolean;
  messageId: string | null;
  position: { x: number; y: number } | null;
}

interface ThreadState {
  isOpen: boolean;
  parentMessageId: string | null;
  parentMessage: any | null;
}

export const useChatState = () => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [reactionPickerState, setReactionPickerState] = useState<ReactionPickerState>({
    isOpen: false,
    messageId: null,
    position: null
  });
  const [threadState, setThreadState] = useState<ThreadState>({
    isOpen: false,
    parentMessageId: null,
    parentMessage: null
  });

  const clearInputs = () => {
    setNewMessage('');
    setSelectedFile(null);
  };

  const handleReactionButtonClick = (event: React.MouseEvent, messageId: string) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    setReactionPickerState({
      isOpen: true,
      messageId,
      position: { x: rect.left, y: rect.top }
    });
  };

  const closeReactionPicker = () => {
    setReactionPickerState({
      isOpen: false,
      messageId: null,
      position: null
    });
  };

  const handleReplyToMessage = (message: any, user: any) => {
    setThreadState({
      isOpen: true,
      parentMessageId: message.id,
      parentMessage: message
    });
  };

  const closeThread = () => {
    setThreadState({
      isOpen: false,
      parentMessageId: null,
      parentMessage: null
    });
  };

  return {
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
  };
};
