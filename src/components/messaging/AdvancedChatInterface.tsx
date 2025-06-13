
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Check, CheckCheck, Clock, User, Camera, Shield, ShieldOff } from 'lucide-react';
import { useRealtimeMessaging } from '@/hooks/useRealtimeMessaging';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Message } from '@/types/messaging';

interface AdvancedChatInterfaceProps {
  conversationId: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  listingInfo?: {
    name: string;
    breed: string;
    price: number;
    image?: string;
  };
}

const AdvancedChatInterface = ({ conversationId, otherUser, listingInfo }: AdvancedChatInterfaceProps) => {
  const { user } = useAuth();
  const { messages, markAsRead } = useRealtimeMessaging();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
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

  const getMessageStatusIcon = (message: Message) => {
    if (message.sender_id !== user?.id) return null;
    
    if (message.read_at) {
      return <CheckCheck size={14} className="text-blue-500" />;
    }
    if (message.created_at) {
      return <Check size={14} className="text-gray-400" />;
    }
    return <Clock size={14} className="text-gray-300" />;
  };

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Chat Header */}
      <CardHeader className="border-b bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherUser.avatar} />
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {otherUser.name}
              </CardTitle>
              {listingInfo && (
                <p className="text-sm text-gray-500">
                  About: {listingInfo.name} - ${listingInfo.price}
                </p>
              )}
              {otherUserTyping && (
                <p className="text-xs text-blue-500">typing...</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {listingInfo && (
              <Badge variant="outline">{listingInfo.breed}</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_id === user?.id;
          const messageTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={isOwn ? user?.user_metadata?.avatar_url : otherUser.avatar} />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>

              <div className={`max-w-xs lg:max-w-md ${isOwn ? 'text-right' : 'text-left'}`}>
                {/* Media Messages */}
                {(message.message_type === 'image' || message.message_type === 'file') && message.image_url && (
                  <div className="mb-2">
                    <img
                      src={message.image_url}
                      alt="Shared content"
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                )}
                
                {/* Text Messages */}
                {message.message_type === 'text' && (
                  <div
                    className={`rounded-lg px-3 py-2 relative ${
                      isOwn
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-1 gap-2">
                  <span className="text-xs text-gray-500">{messageTime}</span>
                  {getMessageStatusIcon(message)}
                </div>
              </div>
            </div>
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
            placeholder="Type your message..."
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

export default AdvancedChatInterface;
