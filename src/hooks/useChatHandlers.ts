
import { useCallback } from 'react';

interface UseChatHandlersProps {
  user: any;
  conversationId: string;
  sendMessage: (conversationId: string, content: string, messageType?: string, imageUrl?: string) => Promise<any>;
}

export const useChatHandlers = ({ user, conversationId, sendMessage }: UseChatHandlersProps) => {
  const handleSendMessage = useCallback(async (
    newMessage: string,
    selectedFile: File | null,
    setSendingMessage: (sending: boolean) => void,
    clearInputs: () => void
  ) => {
    if (!newMessage.trim() && !selectedFile) return;
    if (!user) return;

    try {
      setSendingMessage(true);
      
      if (selectedFile) {
        // Handle file upload logic here if needed
        console.log('File to upload:', selectedFile);
        // For now, just send a text message about the file
        await sendMessage(conversationId, `Shared a file: ${selectedFile.name}`, 'file');
      } else {
        await sendMessage(conversationId, newMessage, 'text');
      }
      
      clearInputs();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  }, [user, conversationId, sendMessage]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>): File | null => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
      return file;
    }
    return null;
  }, []);

  const handleSendVoiceMessage = useCallback(async (audioUrl: string, duration: number) => {
    console.log('Voice message triggered:', { audioUrl, duration });
    await sendMessage(conversationId, `Voice message (${duration}s)`, 'voice', audioUrl);
  }, [conversationId, sendMessage]);

  return {
    handleSendMessage,
    handleFileSelect,
    handleSendVoiceMessage
  };
};
