
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useEnhancedFileUpload } from '@/hooks/useEnhancedFileUpload';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useMessageThreads } from '@/hooks/useMessageThreads';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';
import UnifiedMessageBubble from './UnifiedMessageBubble';
import UnifiedMessageInput from './UnifiedMessageInput';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EnhancedChatInterfaceProps {
  conversationId: string;
  otherUserId: string;
  listingId?: string;
  onBack?: () => void;
}

const EnhancedChatInterface = ({ conversationId, otherUserId, listingId, onBack }: EnhancedChatInterfaceProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { messages, fetchMessages, sendMessage, markAsRead } = useRealtimeMessages();
  const { uploading } = useEnhancedFileUpload();
  const { reactions, addReaction, toggleReaction } = useMessageReactions();
  const { getThreadCount } = useMessageThreads();

  console.log('💬 EnhancedChatInterface - Component rendered with props:', {
    conversationId,
    otherUserId,
    listingId,
    userId: user?.id,
    messageCount: messages.length
  });

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId && user) {
      console.log('📥 EnhancedChatInterface - Loading messages for conversation:', conversationId);
      fetchMessages(conversationId).then(() => {
        console.log('✅ EnhancedChatInterface - Messages loaded successfully, count:', messages.length);
        markAsRead(conversationId);
      }).catch(error => {
        console.error('❌ EnhancedChatInterface - Failed to load messages:', error);
        toast({
          title: "Error loading messages",
          description: "Please refresh and try again",
          variant: "destructive",
        });
      });
    }
  }, [conversationId, user, fetchMessages, markAsRead, toast]);

  // Handle sending message
  const handleSendMessage = async (content: string, type = 'text', options: any = {}) => {
    console.log('📤 EnhancedChatInterface - Send message triggered');
    try {
      await sendMessage(conversationId, content, type, options.imageUrl);
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    console.log('📁 EnhancedChatInterface - File select triggered');
    toast({
      title: "File Upload",
      description: "File upload functionality coming soon!",
    });
  };

  // Handle voice message
  const handleSendVoiceMessage = (audioUrl: string, duration: number) => {
    console.log('🎤 EnhancedChatInterface - Voice message triggered:', { audioUrl, duration });
    handleSendMessage(`Voice message (${duration}s)`, 'voice', { imageUrl: audioUrl });
  };

  const handleReactionClick = (messageId: string) => {
    console.log('😊 EnhancedChatInterface - Reaction click:', messageId);
    // Toggle reaction picker or add default reaction
  };

  if (!user) {
    console.log('❌ EnhancedChatInterface - No user found, showing sign-in prompt');
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Please sign in to access messages</p>
      </div>
    );
  }

  console.log('🎯 EnhancedChatInterface - Rendering with:', {
    messageCount: messages.length,
    reactionCount: Object.keys(reactions).length,
    isUploading: uploading
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-white">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={16} />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User size={16} className="text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold">Chat</h3>
            <p className="text-xs text-gray-500">Active now</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {messages.map((message) => (
            <UnifiedMessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === user?.id}
              onReactionClick={handleReactionClick}
              reactions={reactions[message.id] || []}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Enhanced Input with Templates */}
      <UnifiedMessageInput
        conversationId={conversationId}
        onSendMessage={handleSendMessage}
        onSendVoiceMessage={handleSendVoiceMessage}
        onFileSelect={handleFileSelect}
        disabled={uploading}
      />
    </div>
  );
};

export default EnhancedChatInterface;
