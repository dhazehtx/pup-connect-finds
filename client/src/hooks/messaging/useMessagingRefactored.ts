
import { useConversationsManager } from './useConversationsManager';
import { useMessagesManager } from './useMessagesManager';

export const useMessagingRefactored = () => {
  const {
    conversations,
    loading,
    fetchConversations,
    createConversation,
  } = useConversationsManager();

  const {
    messages,
    setMessages,
    fetchMessages,
    sendMessage,
  } = useMessagesManager();

  return {
    conversations,
    messages,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
  };
};
