
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useEnhancedFileUpload } from '@/hooks/useEnhancedFileUpload';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useMessageThreads } from '@/hooks/useMessageThreads';
import MessagesList from './MessagesList';
import MessageInputArea from './MessageInputArea';
import MessageReactionsPicker from './MessageReactionsPicker';
import MessageThread from './MessageThread';

interface EnhancedChatInterfaceProps {
  conversationId: string;
  otherUserId: string;
  listingId?: string;
}

const EnhancedChatInterface = ({ conversationId, otherUserId, listingId }: EnhancedChatInterfaceProps) => {
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
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { messages, fetchMessages, sendMessage, markAsRead } = useRealtimeMessages();
  const { uploadFile, uploading } = useEnhancedFileUpload();
  const { reactions, addReaction, toggleReaction } = useMessageReactions();
  const { getThreadCount } = useMessageThreads();

  console.log('EnhancedChatInterface loaded for conversation:', conversationId);
  console.log('Current messages:', messages);
  console.log('User:', user?.id);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId && user) {
      console.log('Loading messages for conversation:', conversationId);
      fetchMessages(conversationId).then(() => {
        console.log('Messages loaded successfully');
        markAsRead(conversationId);
      }).catch(error => {
        console.error('Failed to load messages:', error);
        toast({
          title: "Error loading messages",
          description: "Please refresh and try again",
          variant: "destructive",
        });
      });
    }
  }, [conversationId, user, fetchMessages, markAsRead, toast]);

  // Handle sending message
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !user || sendingMessage) {
      console.log('Cannot send message:', { 
        hasContent: !!newMessage.trim(), 
        hasFile: !!selectedFile, 
        hasUser: !!user, 
        sending: sendingMessage 
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
        // Clear inputs
        setNewMessage('');
        setSelectedFile(null);
        
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

  // Handle file selection
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
      
      setSelectedFile(file);
    }
  };

  // Handle key press
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleReactionButtonClick = (event: React.MouseEvent, messageId: string) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    setReactionPickerState({
      isOpen: true,
      messageId,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top
      }
    });
  };

  const handleReactionAdd = (messageId: string, emoji: string) => {
    addReaction(messageId, emoji);
    setReactionPickerState({ isOpen: false, messageId: null, position: null });
  };

  const handleReactionToggle = (messageId: string, emoji: string) => {
    toggleReaction(messageId, emoji);
  };

  const closeReactionPicker = () => {
    setReactionPickerState({ isOpen: false, messageId: null, position: null });
  };

  const handleReplyToMessage = (message: any) => {
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
    setThreadState({
      isOpen: false,
      parentMessageId: null,
      parentMessage: null
    });
  };

  // Add voice message handling
  const handleSendVoiceMessage = async (audioBlob: Blob, duration: number) => {
    if (!user) return;

    console.log('Sending voice message:', { size: audioBlob.size, duration });
    setSendingMessage(true);

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
    } finally {
      setSendingMessage(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Please sign in to access messages</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <MessagesList
        messages={messages}
        user={user}
        reactions={reactions}
        getThreadCount={getThreadCount}
        onReactionButtonClick={handleReactionButtonClick}
        onReplyToMessage={handleReplyToMessage}
        onReactionToggle={handleReactionToggle}
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
        onReactionAdd={handleReactionAdd}
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
        onSendMessage={handleSendMessage}
        onSendVoiceMessage={handleSendVoiceMessage}
        onFileSelect={handleFileSelect}
        onKeyPress={handleKeyPress}
        sendMessage={sendMessage}
        conversationId={conversationId}
      />
    </div>
  );
};

export default EnhancedChatInterface;
