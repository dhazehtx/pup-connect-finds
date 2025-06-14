
import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Send, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string;
}

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  buyer_profile?: any;
  seller_profile?: any;
}

interface MessagesAreaProps {
  selectedConversationId?: string;
  conversations: Conversation[];
  messages: Message[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  sending: boolean;
  unreadCount: number;
  user: any;
  getOtherUser: (conversation: Conversation) => any;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const MessagesArea = ({
  selectedConversationId,
  conversations,
  messages,
  newMessage,
  setNewMessage,
  sending,
  unreadCount,
  user,
  getOtherUser,
  onSendMessage,
  onKeyPress
}: MessagesAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!selectedConversationId) {
    return (
      <Card className="lg:col-span-2">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Select a conversation to start messaging</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const conversation = conversations.find(c => c.id === selectedConversationId);
  const otherUser = conversation ? getOtherUser(conversation) : null;

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {otherUser?.full_name || otherUser?.username || 'Conversation'}
          </CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} new</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col h-[500px]">
        {/* Messages */}
        <ScrollArea className="flex-1 mb-4">
          <div className="space-y-4 p-4">
            {messages.map((message) => {
              const isOwn = message.sender_id === user?.id;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                      isOwn
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      isOwn ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      {isOwn && message.read_at && ' • Read'}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Type a message..."
            disabled={sending}
          />
          <Button
            onClick={onSendMessage}
            disabled={sending || !newMessage.trim()}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagesArea;
