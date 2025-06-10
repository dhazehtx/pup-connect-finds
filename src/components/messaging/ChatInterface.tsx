import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useMessagingRefactored } from '@/hooks/messaging/useMessagingRefactored';
import { useAuth } from '@/contexts/AuthContext';

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

// Demo messages for non-authenticated users
const getDemoMessages = (conversationId: string) => {
  const demoMessagesMap: Record<string, any[]> = {
    'demo-1': [
      {
        id: 'demo-msg-1',
        conversation_id: 'demo-1',
        sender_id: null, // Other user
        content: "Hi! I'm interested in your Golden Retriever puppy. Is he still available?",
        message_type: 'text',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 'demo-msg-2', 
        conversation_id: 'demo-1',
        sender_id: 'current-user', // Current user
        content: "Yes, he's still available! He's 8 weeks old and ready for his new home.",
        message_type: 'text',
        created_at: '2024-01-15T10:05:00Z'
      },
      {
        id: 'demo-msg-3',
        conversation_id: 'demo-1', 
        sender_id: null, // Other user
        content: "That's wonderful! Could we arrange a time to meet him?",
        message_type: 'text',
        created_at: '2024-01-15T10:10:00Z'
      },
      {
        id: 'demo-msg-4',
        conversation_id: 'demo-1',
        sender_id: 'current-user', // Current user  
        content: "Absolutely! I'm available this weekend. What works best for you?",
        message_type: 'text',
        created_at: '2024-01-15T10:15:00Z'
      }
    ],
    'demo-2': [
      {
        id: 'demo-msg-5',
        conversation_id: 'demo-2',
        sender_id: null, // Other user
        content: "Hello! Is the Labrador Mix still looking for a home?",
        message_type: 'text', 
        created_at: '2024-01-14T14:00:00Z'
      },
      {
        id: 'demo-msg-6',
        conversation_id: 'demo-2',
        sender_id: 'current-user', // Current user
        content: "Hi Mike! Yes, she's still available. She's very friendly and great with kids.",
        message_type: 'text',
        created_at: '2024-01-14T14:05:00Z'
      },
      {
        id: 'demo-msg-7',
        conversation_id: 'demo-2',
        sender_id: null, // Other user
        content: "Perfect! We have two young children. Could you tell me more about her temperament?",
        message_type: 'text',
        created_at: '2024-01-14T14:10:00Z'
      }
    ],
    'demo-3': [
      {
        id: 'demo-msg-8',
        conversation_id: 'demo-3',
        sender_id: null, // Other user
        content: "Hi! I saw your German Shepherd listing. Is he trained?",
        message_type: 'text',
        created_at: '2024-01-13T16:00:00Z'
      },
      {
        id: 'demo-msg-9',
        conversation_id: 'demo-3',
        sender_id: 'current-user', // Current user
        content: "Yes! He knows basic commands and is house trained. Very well behaved.",
        message_type: 'text',
        created_at: '2024-01-13T16:05:00Z'
      }
    ]
  };
  
  return demoMessagesMap[conversationId] || [];
};

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
  const [demoMessages, setDemoMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const { messages, sendMessage, fetchMessages } = useMessagingRefactored();

  // Check if this is a demo conversation
  const isDemoConversation = conversationId.startsWith('demo-');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isDemoConversation) {
      // Load demo messages for demo conversations
      console.log('Loading demo messages for conversation:', conversationId);
      setDemoMessages(getDemoMessages(conversationId));
    } else if (conversationId && user) {
      // Only fetch real messages for real conversations when user is authenticated
      console.log('Fetching real messages for conversation:', conversationId);
      fetchMessages(conversationId);
    }
  }, [conversationId, user, isDemoConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, demoMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    if (isDemoConversation) {
      // Handle demo message sending
      const newDemoMessage = {
        id: `demo-msg-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: 'current-user',
        content: newMessage,
        message_type: 'text',
        created_at: new Date().toISOString()
      };
      
      setDemoMessages(prev => [...prev, newDemoMessage]);
      setNewMessage('');

      // Simulate typing indicator and response for demo
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const autoReply = {
          id: `demo-msg-${Date.now() + 1}`,
          conversation_id: conversationId,
          sender_id: null,
          content: "Thanks for your message! This is a demo conversation.",
          message_type: 'text',
          created_at: new Date().toISOString()
        };
        setDemoMessages(prev => [...prev, autoReply]);
      }, 2000);
    } else if (user) {
      // Handle real message sending for authenticated users
      const messageContent = newMessage;
      setNewMessage('');
      await sendMessage(conversationId, messageContent);

      // Simulate typing indicator
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Use demo messages for demo conversations, real messages for real conversations
  const displayMessages = isDemoConversation ? demoMessages : messages;

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

      {/* Demo Mode Notice */}
      {isDemoConversation && (
        <div className="p-3 bg-blue-50 border-b flex items-center justify-center">
          <p className="text-sm text-blue-700">
            <strong>Demo Mode:</strong> This is a sample conversation for preview
          </p>
        </div>
      )}

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
        {displayMessages.map((message) => {
          const isCurrentUser = isDemoConversation 
            ? message.sender_id === 'current-user'
            : message.sender_id === user?.id;
            
          return (
            <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                <div
                  className={`p-3 rounded-2xl ${
                    isCurrentUser
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
                <p className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                  {formatTime(message.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        
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
              placeholder={isDemoConversation ? "Type a demo message..." : "Type a message..."}
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
