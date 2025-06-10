
import { useToast } from '@/hooks/use-toast';
import { useEnhancedFileUpload } from '@/hooks/useEnhancedFileUpload';

interface UseChatHandlersProps {
  user: any;
  conversationId: string;
  sendMessage: (conversationId: string, content: string, messageType?: string, imageUrl?: string) => Promise<any>;
}

export const useChatHandlers = ({ user, conversationId, sendMessage }: UseChatHandlersProps) => {
  const { toast } = useToast();
  const { uploadFile } = useEnhancedFileUpload();

  console.log('🔧 useChatHandlers - Initialized with:', {
    userId: user?.id,
    conversationId,
    hasUploadFile: !!uploadFile
  });

  const handleSendMessage = async (
    newMessage: string,
    selectedFile: File | null,
    setSendingMessage: (sending: boolean) => void,
    clearInputs: () => void
  ) => {
    console.log('📤 useChatHandlers - Starting to send message:', {
      hasContent: !!newMessage.trim(),
      hasFile: !!selectedFile,
      hasUser: !!user,
      messageLength: newMessage.trim().length
    });

    if ((!newMessage.trim() && !selectedFile) || !user) {
      console.log('❌ useChatHandlers - Cannot send message - validation failed:', { 
        hasContent: !!newMessage.trim(), 
        hasFile: !!selectedFile, 
        hasUser: !!user
      });
      return;
    }

    console.log('✅ useChatHandlers - Validation passed, proceeding with send');
    setSendingMessage(true);

    try {
      let imageUrl: string | undefined;

      // Upload file if selected
      if (selectedFile) {
        console.log('📁 useChatHandlers - Starting file upload:', {
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileType: selectedFile.type
        });
        try {
          imageUrl = await uploadFile(selectedFile, {
            bucket: 'dog-images',
            folder: 'messages',
            maxSize: 10,
            allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
          }) || undefined;
          console.log('✅ useChatHandlers - File uploaded successfully:', imageUrl);
        } catch (uploadError) {
          console.error('❌ useChatHandlers - File upload failed:', uploadError);
          toast({
            title: "Upload failed",
            description: "Failed to upload image. Sending text only.",
            variant: "destructive",
          });
        }
      }

      // Send message
      const messageContent = newMessage.trim() || (selectedFile ? 'Image' : '');
      const messageType = selectedFile ? 'image' : 'text';
      
      console.log('📨 useChatHandlers - Sending message with data:', {
        messageContent: messageContent.substring(0, 50),
        messageType,
        hasImageUrl: !!imageUrl,
        conversationId
      });
      
      const result = await sendMessage(conversationId, messageContent, messageType, imageUrl);

      if (result) {
        console.log('✅ useChatHandlers - Message sent successfully:', {
          messageId: result.id,
          timestamp: result.created_at
        });
        clearInputs();
        
        toast({
          title: "Message sent",
          description: selectedFile ? "Image sent successfully" : "Message sent",
        });
      } else {
        console.error('❌ useChatHandlers - No result returned from sendMessage');
        throw new Error('No result returned from sendMessage');
      }
    } catch (error) {
      console.error('❌ useChatHandlers - Failed to send message:', error);
      toast({
        title: "Failed to send message",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      console.log('🏁 useChatHandlers - Send message process completed');
      setSendingMessage(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('📁 useChatHandlers - File selection event:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    });
    
    if (file) {
      console.log('📁 useChatHandlers - Processing selected file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString()
      });
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        console.error('❌ useChatHandlers - Invalid file type:', file.type);
        toast({
          title: "Invalid file type",
          description: "Please select a JPEG, PNG, or WebP image",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        console.error('❌ useChatHandlers - File too large:', `${file.size} bytes`);
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      console.log('✅ useChatHandlers - File validation passed');
      return file;
    }
  };

  const handleSendVoiceMessage = async (audioBlob: Blob, duration: number) => {
    if (!user) {
      console.log('❌ useChatHandlers - Cannot send voice message: no user');
      return;
    }

    console.log('🎙️ useChatHandlers - Starting voice message send:', {
      blobSize: audioBlob.size,
      duration,
      userId: user.id
    });

    try {
      // Convert Blob to File
      const audioFile = new File([audioBlob], `voice-message-${Date.now()}.webm`, { 
        type: 'audio/webm',
        lastModified: Date.now()
      });

      console.log('🎙️ useChatHandlers - Voice file created:', {
        fileName: audioFile.name,
        fileSize: audioFile.size,
        fileType: audioFile.type
      });

      // Upload voice file
      const voiceUrl = await uploadFile(audioFile, {
        bucket: 'dog-images',
        folder: 'voice-messages',
        maxSize: 50, // 50MB for voice messages
        allowedTypes: ['audio/webm', 'audio/wav', 'audio/mp3']
      });

      if (voiceUrl) {
        console.log('✅ useChatHandlers - Voice file uploaded successfully:', voiceUrl);
        const result = await sendMessage(
          conversationId, 
          `Voice message (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})`, 
          'voice', 
          voiceUrl
        );

        if (result) {
          console.log('✅ useChatHandlers - Voice message sent successfully:', result.id);
          toast({
            title: "Voice message sent",
            description: "Your voice message was sent successfully",
          });
        }
      } else {
        throw new Error('Failed to upload voice message');
      }
    } catch (error) {
      console.error('❌ useChatHandlers - Failed to send voice message:', error);
      toast({
        title: "Failed to send voice message",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return {
    handleSendMessage,
    handleFileSelect,
    handleSendVoiceMessage
  };
};
