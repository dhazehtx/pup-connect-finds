
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface QueuedMessage {
  id: string;
  conversationId: string;
  content: string;
  messageType: string;
  imageUrl?: string;
  timestamp: number;
  attempts: number;
}

export const useOfflineMessages = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [messageQueue, setMessageQueue] = useState<QueuedMessage[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back online",
        description: "Syncing queued messages...",
      });
      processMessageQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description: "Messages will be queued and sent when you're back online.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueMessage = (
    conversationId: string,
    content: string,
    messageType: string = 'text',
    imageUrl?: string
  ) => {
    const queuedMessage: QueuedMessage = {
      id: Date.now().toString(),
      conversationId,
      content,
      messageType,
      imageUrl,
      timestamp: Date.now(),
      attempts: 0
    };

    setMessageQueue(prev => [...prev, queuedMessage]);
    
    toast({
      title: "Message queued",
      description: "Your message will be sent when you're back online.",
    });
  };

  const processMessageQueue = async () => {
    if (!isOnline || messageQueue.length === 0) return;

    const failedMessages: QueuedMessage[] = [];

    for (const message of messageQueue) {
      try {
        // Here you would call your actual sendMessage function
        // For now, we'll simulate it
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Sent queued message:', message.id);
      } catch (error) {
        console.error('Failed to send queued message:', error);
        
        if (message.attempts < 3) {
          failedMessages.push({
            ...message,
            attempts: message.attempts + 1
          });
        } else {
          toast({
            title: "Message failed to send",
            description: "A queued message could not be delivered after multiple attempts.",
            variant: "destructive",
          });
        }
      }
    }

    setMessageQueue(failedMessages);
    
    if (failedMessages.length === 0) {
      toast({
        title: "All messages sent",
        description: "Your queued messages have been delivered.",
      });
    }
  };

  return {
    isOnline,
    messageQueue,
    queueMessage,
    processMessageQueue
  };
};
