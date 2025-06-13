
import React, { useState, useEffect, useRef } from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Camera } from 'lucide-react';
import { useRealtimeMessaging } from '@/hooks/useRealtimeMessaging';
import { useAuth } from '@/contexts/AuthContext';
import RealTimeChatHeader from './RealTimeChatHeader';
import MessageBubble from './MessageBubble';
import { Message, ChatUser, ListingInfo } from '@/types/chat';

interface RealTimeChatInterfaceProps {
  conversationId: string;
  otherUser: ChatUser;
  listingInfo?: ListingInfo;
}

const RealTimeChatInterface = ({ conversationId, otherUser, listingInfo }: RealTimeChatInterfaceProps) => {
  const { user } = useAuth();
  const { messages, markAsRead } = useRealtimeMessaging();
  const [newMessage, setNewMessage] = useState('');
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (conversationId) {
      markAsRead(conversationId);
    }
  }, [messages, conversationId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const { sendMessage } = useRealtimeMessaging();
      await sendMessage(conversationId, newMessage.trim(), 'text');
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Type-safe message filtering
  const typedMessages: Message[] = messages.filter((msg): msg is Message => {
    const validTypes: Array<Message['message_type']> = ['image', 'text', 'file', 'voice'];
    return (
      typeof msg.id === 'string' &&
      typeof msg.conversation_id === 'string' &&
      typeof msg.sender_id === 'string' &&
      typeof msg.content === 'string' &&
      typeof msg.created_at === 'string' &&
      validTypes.includes(msg.message_type as Message['message_type'])
    );
  });

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      <RealTimeChatHeader
        otherUser={otherUser}
        listingInfo={listingInfo}
        otherUserTyping={otherUserTyping}
        encryptionEnabled={encryptionEnabled}
        onToggleEncryption={() => setEncryptionEnabled(!encryptionEnabled)}
      />

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {typedMessages.map((message, index) => {
          const isOwn = message.sender_id === user?.id;
          const prevMessage = index > 0 ? typedMessages[index - 1] : null;
          const showAvatar = !isOwn && (!prevMessage || prevMessage.sender_id !== message.sender_id);

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={isOwn}
              senderName={isOwn ? user?.user_metadata?.full_name : otherUser.name}
              senderAvatar={isOwn ? user?.user_metadata?.avatar_url : otherUser.avatar}
              showAvatar={showAvatar}
            />
          );
        })}
        
        {otherUserTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-1">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-xs ml-2">typing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4 bg-white">
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Camera size={16} />
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={encryptionEnabled ? "Type your encrypted message..." : "Type your message..."}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="icon"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RealTimeChatInterface;
