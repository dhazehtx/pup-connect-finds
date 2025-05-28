
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useMessaging } from '@/hooks/useMessaging';

interface ChatInterfaceProps {
  conversationId: string;
  recipientName: string;
  recipientAvatar: string;
  isOnline?: boolean;
  onBack?: () => void;
  listingInfo?: {
    name: string;
    breed: string;
    image: string | null;
  };
}

const ChatInterface = ({ 
  conversationId, 
  recipientName, 
  recipientAvatar, 
  isOnline = false,
  onBack,
  listingInfo 
}: ChatInterfaceProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, sendMessage, fetchMessages } = useMessaging();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage;
    setNewMessage('');

    await sendMessage(conversationId, messageContent);

    // Simulate typing indicator and response (remove this in production)
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft size={20} />
            </Button>
          )}
          <div className="relative">
            <Avatar className="w-10 h-10">
              <img src={recipientAvatar} alt={recipientName} className="w-full h-full object-cover" />
            </Avatar>
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{recipientName}</h3>
            <p className="text-xs text-gray-500">
              {isOnline ? 'Online' : 'Last seen 2h ago'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Phone size={20} />
          </Button>
          <Button variant="ghost" size="icon">
            <Video size={20} />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical size={20} />
          </Button>
        </div>
      </div>

      {/* Listing Info Banner */}
      {listingInfo && (
        <div className="p-3 bg-blue-50 border-b flex items-center gap-3">
          {listingInfo.image && (
            <img 
              src={listingInfo.image} 
              alt={listingInfo.name}
              className="w-10 h-10 rounded object-cover"
            />
          )}
          <div className="flex-1">
            <p className="font-medium text-sm">{listingInfo.name}</p>
            <Badge variant="secondary" className="text-xs">
              {listingInfo.breed}
            </Badge>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender_id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] ${message.sender_id ? 'order-2' : 'order-1'}`}>
              <div
                className={`p-3 rounded-2xl ${
                  message.sender_id
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                }`}
              >
                {message.message_type === 'text' ? (
                  <p className="text-sm">{message.content}</p>
                ) : (
                  <img
                    src={message.image_url || ''}
                    alt="Shared image"
                    className="max-w-full rounded-lg"
                  />
                )}
              </div>
              <p className={`text-xs text-gray-500 mt-1 ${message.sender_id ? 'text-right' : 'text-left'}`}>
                {formatTime(message.created_at)}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip size={20} />
          </Button>
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="pr-10"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button variant="ghost" size="icon" className="absolute right-0 top-0">
              <Smile size={20} />
            </Button>
          </div>
          <Button 
            onClick={handleSendMessage}
            className="bg-blue-500 hover:bg-blue-600"
            size="icon"
            disabled={!newMessage.trim()}
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
