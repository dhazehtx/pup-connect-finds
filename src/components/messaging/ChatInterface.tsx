
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Phone, Video, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
  type: 'text' | 'image';
  imageUrl?: string;
}

interface ChatInterfaceProps {
  recipientName: string;
  recipientAvatar: string;
  isOnline?: boolean;
}

const ChatInterface = ({ recipientName, recipientAvatar, isOnline = false }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! Is the Golden Retriever puppy still available?',
      timestamp: new Date(Date.now() - 3600000),
      isOwn: true,
      type: 'text'
    },
    {
      id: '2',
      text: 'Yes, she is! Would you like to schedule a visit?',
      timestamp: new Date(Date.now() - 3000000),
      isOwn: false,
      type: 'text'
    },
    {
      id: '3',
      text: 'That would be great! What times are available this weekend?',
      timestamp: new Date(Date.now() - 1800000),
      isOwn: true,
      type: 'text'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      timestamp: new Date(),
      isOwn: true,
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate typing indicator and response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thanks for your message! I\'ll get back to you soon.',
        timestamp: new Date(),
        isOwn: false,
        type: 'text'
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] ${message.isOwn ? 'order-2' : 'order-1'}`}>
              <div
                className={`p-3 rounded-2xl ${
                  message.isOwn
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                }`}
              >
                {message.type === 'text' ? (
                  <p className="text-sm">{message.text}</p>
                ) : (
                  <img
                    src={message.imageUrl}
                    alt="Shared image"
                    className="max-w-full rounded-lg"
                  />
                )}
              </div>
              <p className={`text-xs text-gray-500 mt-1 ${message.isOwn ? 'text-right' : 'text-left'}`}>
                {formatTime(message.timestamp)}
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
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button variant="ghost" size="icon" className="absolute right-0 top-0">
              <Smile size={20} />
            </Button>
          </div>
          <Button 
            onClick={sendMessage}
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
