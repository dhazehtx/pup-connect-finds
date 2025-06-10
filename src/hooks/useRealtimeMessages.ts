
import { useState, useCallback } from 'react';
import { useMessageSubscription } from './messaging/useMessageSubscription';
import { useMessageOperations } from './messaging/useMessageOperations';
import { useMessageFetcher } from './messaging/useMessageFetcher';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  image_url?: string;
  read_at?: string;
  created_at: string;
  is_encrypted?: boolean;
  encrypted_content?: string;
  encryption_key_id?: string;
}

export const useRealtimeMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const { fetchMessages: fetchMessagesBase } = useMessageFetcher();
  const { sendMessage, markAsRead } = useMessageOperations();

  const handleNewMessage = useCallback((newMessage: Message) => {
    setMessages(prev => {
      // Avoid duplicates
      const exists = prev.some(msg => msg.id === newMessage.id);
      if (exists) return prev;
      return [...prev, newMessage];
    });
  }, []);

  const handleMessageUpdate = useCallback((updatedMessage: Message) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === updatedMessage.id ? updatedMessage : msg
      )
    );
  }, []);

  useMessageSubscription({
    conversationId: currentConversationId,
    onNewMessage: handleNewMessage,
    onMessageUpdate: handleMessageUpdate
  });

  const fetchMessages = useCallback(async (conversationId: string) => {
    const messages = await fetchMessagesBase(conversationId);
    setMessages(messages);
    setCurrentConversationId(conversationId);
  }, [fetchMessagesBase]);

  const sendMessageWithOptimisticUpdate = useCallback(async (
    conversationId: string, 
    content: string, 
    messageType: string = 'text', 
    imageUrl?: string
  ) => {
    const result = await sendMessage(conversationId, content, messageType, imageUrl);
    
    // Add message to local state immediately for better UX
    if (result && conversationId === currentConversationId) {
      handleNewMessage(result);
    }
    
    return result;
  }, [sendMessage, currentConversationId, handleNewMessage]);

  return {
    messages,
    setMessages,
    fetchMessages,
    sendMessage: sendMessageWithOptimisticUpdate,
    markAsRead
  };
};
