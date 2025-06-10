
import React, { useEffect, useRef } from 'react';
import { useRealtimeMessages } from '@/hooks/useRealtime';
import { useMessagingRefactored } from '@/hooks/messaging/useMessagingRefactored';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface RealtimeChatProps {
  conversationId: string;
  children: React.ReactNode;
}

const RealtimeChat = ({ conversationId, children }: RealtimeChatProps) => {
  const { user } = useAuth();
  const { fetchMessages } = useMessagingRefactored();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMessagePoll = async () => {
    try {
      await fetchMessages(conversationId);
      // Auto-scroll to bottom when new messages are detected
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error polling messages:', error);
    }
  };

  const { isConnected } = useRealtimeMessages(conversationId, handleMessagePoll);

  useEffect(() => {
    scrollToBottom();
  }, []);

  return (
    <div className="relative h-full">
      {children}
      <div ref={messagesEndRef} />
      {isConnected && (
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Auto-refresh active</span>
        </div>
      )}
    </div>
  );
};

export default RealtimeChat;
