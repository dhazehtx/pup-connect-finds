
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

  const handleSendMessage = async (
    newMessage: string,
    selectedFile: File | null,
    setSendingMessage: (sending: boolean) => void,
    clearInputs: () => void
  ) => {
    if ((!newMessage.trim() && !selectedFile) || !user) {
      console.log('Cannot send message:', { 
        hasContent: !!newMessage.trim(), 
        hasFile: !!selectedFile, 
        hasUser: !!user
      });
      return;
    }

    console.log('Sending message:', { content: newMessage, hasFile: !!selectedFile });
    setSendingMessage(true);

    try {
      let imageUrl: string | undefined;

      // Upload file if selected
      if (selectedFile) {
        console.log('Uploading file:', selectedFile.name);
        try {
          imageUrl = await uploadFile(selectedFile, {
            bucket: 'dog-images',
            folder: 'messages',
            maxSize: 10,
            allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
          }) || undefined;
          console.log('File uploaded successfully:', imageUrl);
        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
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
      
      console.log('Sending message with:', { messageContent, messageType, imageUrl });
      
      const result = await sendMessage(conversationId, messageContent, messageType, imageUrl);

      if (result) {
        console.log('Message sent successfully:', result.id);
        clearInputs();
        
        toast({
          title: "Message sent",
          description: selectedFile ? "Image sent successfully" : "Message sent",
        });
      } else {
        throw new Error('No result returned from sendMessage');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Failed to send message",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.size, file.type);
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a JPEG, PNG, or WebP image",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      return file;
    }
  };

  const handleSendVoiceMessage = async (audioBlob: Blob, duration: number) => {
    if (!user) return;

    console.log('Sending voice message:', { size: audioBlob.size, duration });

    try {
      // Convert Blob to File
      const audioFile = new File([audioBlob], `voice-message-${Date.now()}.webm`, { 
        type: 'audio/webm',
        lastModified: Date.now()
      });

      // Upload voice file
      const voiceUrl = await uploadFile(audioFile, {
        bucket: 'dog-images',
        folder: 'voice-messages',
        maxSize: 50, // 50MB for voice messages
        allowedTypes: ['audio/webm', 'audio/wav', 'audio/mp3']
      });

      if (voiceUrl) {
        const result = await sendMessage(
          conversationId, 
          `Voice message (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})`, 
          'voice', 
          voiceUrl
        );

        if (result) {
          console.log('Voice message sent successfully:', result.id);
          toast({
            title: "Voice message sent",
            description: "Your voice message was sent successfully",
          });
        }
      } else {
        throw new Error('Failed to upload voice message');
      }
    } catch (error) {
      console.error('Failed to send voice message:', error);
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
