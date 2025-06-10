
import { useCallback } from 'react';
import { useEnhancedFileUpload } from '@/hooks/useEnhancedFileUpload';
import { usePresenceManager } from '@/hooks/usePresenceManager';
import { useToast } from '@/hooks/use-toast';

interface UseChatHandlersProps {
  user: any;
  conversationId: string;
  sendMessage: (conversationId: string, content: string, messageType?: string, imageUrl?: string) => Promise<any>;
}

export const useChatHandlers = ({ user, conversationId, sendMessage }: UseChatHandlersProps) => {
  const { uploadSingleFile } = useEnhancedFileUpload();
  const { sendTypingIndicator } = usePresenceManager();
  const { toast } = useToast();

  console.log('🎛️ useChatHandlers - Initialized:', {
    userId: user?.id,
    conversationId
  });

  const handleSendMessage = useCallback(async (
    newMessage: string,
    selectedFile: File | null,
    setSendingMessage: (sending: boolean) => void,
    clearInputs: () => void
  ) => {
    if ((!newMessage.trim() && !selectedFile) || !user) {
      console.log('❌ useChatHandlers - Cannot send empty message or no user');
      return;
    }

    console.log('📤 useChatHandlers - Sending message:', {
      hasContent: !!newMessage.trim(),
      hasFile: !!selectedFile,
      userId: user.id
    });

    setSendingMessage(true);

    try {
      let imageUrl: string | undefined;

      // Upload file if present
      if (selectedFile) {
        console.log('📎 useChatHandlers - Uploading file:', selectedFile.name);
        const uploadedFile = await uploadSingleFile(selectedFile);
        if (uploadedFile) {
          imageUrl = uploadedFile.url;
          console.log('✅ useChatHandlers - File uploaded:', imageUrl);
        } else {
          throw new Error('Failed to upload file');
        }
      }

      // Send message
      const messageType = selectedFile ? 
        (selectedFile.type.startsWith('image/') ? 'image' : 'file') : 
        'text';

      const result = await sendMessage(
        conversationId,
        newMessage.trim() || `Shared ${selectedFile?.type.startsWith('image/') ? 'an image' : 'a file'}: ${selectedFile?.name}`,
        messageType,
        imageUrl
      );

      if (result) {
        console.log('✅ useChatHandlers - Message sent successfully:', result.id);
        clearInputs();
        
        // Stop typing indicator
        await sendTypingIndicator(conversationId, false);
        
        toast({
          title: "Message sent",
          description: selectedFile ? "File shared successfully" : "Message delivered",
        });
      }
    } catch (error) {
      console.error('❌ useChatHandlers - Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  }, [user, conversationId, sendMessage, uploadSingleFile, sendTypingIndicator, toast]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>): File | null => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ useChatHandlers - No file selected');
      return null;
    }

    console.log('📎 useChatHandlers - File selected:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 50MB",
        variant: "destructive",
      });
      return null;
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Please select an image, PDF, or document file",
        variant: "destructive",
      });
      return null;
    }

    return file;
  }, [toast]);

  const handleSendVoiceMessage = useCallback(async (audioBlob: Blob, duration: number) => {
    if (!user) {
      console.log('❌ useChatHandlers - No user for voice message');
      return;
    }

    console.log('🎤 useChatHandlers - Sending voice message:', {
      duration,
      size: audioBlob.size,
      userId: user.id
    });

    try {
      // Convert blob to file for upload
      const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, {
        type: 'audio/webm'
      });

      const uploadedFile = await uploadSingleFile(audioFile);
      if (!uploadedFile) {
        throw new Error('Failed to upload voice message');
      }

      console.log('✅ useChatHandlers - Voice file uploaded:', uploadedFile.url);

      // Send voice message
      await sendMessage(
        conversationId,
        `Voice message (${Math.round(duration)}s)`,
        'voice',
        uploadedFile.url
      );

      toast({
        title: "Voice message sent",
        description: `${Math.round(duration)} second recording shared`,
      });

    } catch (error) {
      console.error('❌ useChatHandlers - Error sending voice message:', error);
      toast({
        title: "Failed to send voice message",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  }, [user, conversationId, sendMessage, uploadSingleFile, toast]);

  const handleStartTyping = useCallback(() => {
    console.log('⌨️ useChatHandlers - User started typing');
    sendTypingIndicator(conversationId, true);
  }, [conversationId, sendTypingIndicator]);

  const handleStopTyping = useCallback(() => {
    console.log('⌨️ useChatHandlers - User stopped typing');
    sendTypingIndicator(conversationId, false);
  }, [conversationId, sendTypingIndicator]);

  return {
    handleSendMessage,
    handleFileSelect,
    handleSendVoiceMessage,
    handleStartTyping,
    handleStopTyping
  };
};
