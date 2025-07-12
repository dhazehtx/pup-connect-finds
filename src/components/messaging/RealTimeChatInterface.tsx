import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Loader2 } from 'lucide-react';
import { useMessagesManager } from '@/hooks/messaging/useMessagesManager';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RealTimeChatInterfaceProps {
  conversationId: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  listingInfo?: {
    id: string;
    name: string;
    breed?: string;
    price: number;
    image_url?: string;
    dog_name: string;
  };
}

const RealTimeChatInterface: React.FC<RealTimeChatInterfaceProps> = ({
  conversationId,
  otherUser,
  listingInfo
}) => {
  const { user } = useAuth();
  const { messages, fetchMessages, sendMessage } = useMessagesManager();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Suggested messages for first interaction
  const suggestedMessages = [
    "Hi! Is this puppy still available?",
    "Can you tell me more about this puppy?",
    "When would the puppy be available?",
    "What's included with the puppy?",
    "Can we schedule a time to meet?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      await fetchMessages(conversationId);
      setLoading(false);
    };
    
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          fetchMessages(conversationId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, fetchMessages]);

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || newMessage.trim();
    if (!messageContent || sending) return;

    setSending(true);
    try {
      await sendMessage(conversationId, messageContent);
      setNewMessage('');
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isFirstMessage = messages.length === 0;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-gray-50">
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser.avatar} />
          <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{otherUser.name}</h3>
          <p className="text-sm text-gray-600">
            {listingInfo ? `About ${listingInfo.dog_name}` : 'Active now'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender_id === user?.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {new Date(message.created_at).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        ))}
        
        {/* Suggested messages for first interaction */}
        {isFirstMessage && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 font-medium">Quick messages:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedMessages.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage(suggestion)}
                  disabled={sending}
                  className="text-sm"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={handleKeyPress}
            disabled={sending}
            className="flex-1"
          />
          <Button 
            onClick={() => handleSendMessage()} 
            disabled={!newMessage.trim() || sending}
            size="icon"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RealTimeChatInterface;
