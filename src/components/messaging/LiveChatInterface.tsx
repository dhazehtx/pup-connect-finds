
import React, { useState, useEffect, useRef } from 'react';
import { useRealtimeMessaging } from '@/hooks/useRealtimeMessaging';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useAuth } from '@/contexts/AuthContext';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { Loader2 } from 'lucide-react';
import ErrorState from '@/components/ui/error-state';

interface LiveChatInterfaceProps {
  conversationId: string;
  otherUserId: string;
  onBack: () => void;
}

const LiveChatInterface = ({ conversationId, otherUserId, onBack }: LiveChatInterfaceProps) => {
  const { user } = useAuth();
  const { messages, sendMessage, fetchMessages, loading } = useRealtimeMessaging();
  const { isUserOnline } = useUserPresence();
  const [otherUser, setOtherUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation data
  useEffect(() => {
    const loadConversation = async () => {
      try {
        await fetchMessages(conversationId);
        // Mock other user data for demo
        setOtherUser({
          full_name: 'Chat Partner',
          avatar_url: '/placeholder.svg',
          username: 'chat_partner'
        });
      } catch (err) {
        setError('Failed to load conversation');
      }
    };

    if (conversationId) {
      loadConversation();
    }
  }, [conversationId, fetchMessages]);

  const handleSendMessage = async (content: string, type: 'text' | 'image' | 'file' = 'text') => {
    try {
      await sendMessage(conversationId, content, type);
    } catch (err) {
      setError('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Chat Error"
        message={error}
        onRetry={() => {
          setError(null);
          fetchMessages(conversationId);
        }}
      />
    );
  }

  if (!otherUser) {
    return (
      <ErrorState
        title="User Not Found"
        message="Unable to load chat partner information"
        onRetry={onBack}
        retryText="Go Back"
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <ChatHeader
        user={otherUser}
        isOnline={isUserOnline(otherUserId)}
        onBack={onBack}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === user?.id}
              senderName={message.sender_id === user?.id ? (user.user_metadata?.full_name || 'You') : otherUser.full_name}
              senderAvatar={message.sender_id === user?.id ? user.user_metadata?.avatar_url : otherUser.avatar_url}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={!user}
      />
    </div>
  );
};

export default LiveChatInterface;
