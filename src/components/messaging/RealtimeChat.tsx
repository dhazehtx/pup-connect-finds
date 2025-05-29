
import React, { useEffect, useRef } from 'react';
import { useRealtimeMessages } from '@/hooks/useRealtime';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface RealtimeChatProps {
  conversationId: string;
  children: React.ReactNode;
}

const RealtimeChat = ({ conversationId, children }: RealtimeChatProps) => {
  const { user } = useAuth();
  const { fetchMessages } = useMessaging();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewMessage = (message: any) => {
    // Show notification for new messages from others
    if (message.sender_id !== user?.id) {
      toast({
        title: "New message",
        description: "You have received a new message",
      });
      
      // Refresh messages to show the new one
      fetchMessages(conversationId);
    }
    
    // Auto-scroll to bottom
    setTimeout(scrollToBottom, 100);
  };

  const { isConnected } = useRealtimeMessages(conversationId, handleNewMessage);

  useEffect(() => {
    scrollToBottom();
  }, []);

  return (
    <div className="relative h-full">
      {children}
      <div ref={messagesEndRef} />
      {isConnected && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"></div>
      )}
    </div>
  );
};

export default RealtimeChat;
