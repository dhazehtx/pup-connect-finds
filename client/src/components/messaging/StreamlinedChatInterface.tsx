
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealTimeMessages } from '@/hooks/useRealTimeMessages';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Card, CardContent } from '@/components/ui/card';
import ChatHeader from './chat/ChatHeader';
import MessagesList from './chat/MessagesList';
import ChatInput from './chat/ChatInput';

interface StreamlinedChatInterfaceProps {
  conversationId: string;
  otherUserId: string;
  onBack: () => void;
}

const StreamlinedChatInterface = ({ conversationId, otherUserId, onBack }: StreamlinedChatInterfaceProps) => {
  const { user } = useAuth();
  const { messages, fetchMessages, sendMessage } = useRealTimeMessages();
  const { uploadImage, uploading } = useFileUpload();
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(false);

  useEffect(() => {
    if (conversationId && user) {
      fetchMessages(conversationId);
    }
  }, [conversationId, user, fetchMessages]);

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !user) return;

    try {
      if (selectedFile) {
        const imageUrl = await uploadImage(selectedFile);
        if (imageUrl) {
          await sendMessage(conversationId, `Shared an image: ${selectedFile.name}`, 'image', imageUrl);
        }
        setSelectedFile(null);
      } else {
        await sendMessage(conversationId, newMessage.trim(), 'text');
      }
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSendVoiceMessage = async (audioUrl: string, duration: number) => {
    try {
      await sendMessage(conversationId, `Voice message (${duration}s)`, 'voice', audioUrl);
      setShowVoiceRecorder(false);
    } catch (error) {
      console.error('Failed to send voice message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <Card className="rounded-none border-b">
        <ChatHeader
          onBack={onBack}
          conversationId={conversationId}
          otherUserId={otherUserId}
          isEncrypted={isEncrypted}
          onToggleEncryption={setIsEncrypted}
          showVideoCall={showVideoCall}
          setShowVideoCall={setShowVideoCall}
          isVideoCallActive={isVideoCallActive}
          setIsVideoCallActive={setIsVideoCallActive}
        />
      </Card>

      {/* Messages */}
      <MessagesList messages={messages} />

      {/* Input */}
      <Card className="rounded-none border-t">
        <CardContent className="p-0">
          <ChatInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            uploading={uploading}
            isEncrypted={isEncrypted}
            showVoiceRecorder={showVoiceRecorder}
            setShowVoiceRecorder={setShowVoiceRecorder}
            onSendMessage={handleSendMessage}
            onSendVoiceMessage={handleSendVoiceMessage}
            onKeyPress={handleKeyPress}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StreamlinedChatInterface;
