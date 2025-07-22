
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface QueuedMessage {
  id: string;
  conversationId: string;
  content: string;
  timestamp: string;
  retryCount: number;
}

export const useOfflineMessages = () => {
  const [messageQueue, setMessageQueue] = useState<QueuedMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isOnline } = useNetworkStatus();
  const { toast } = useToast();

  // Load queued messages from localStorage on init
  useEffect(() => {
    const savedQueue = localStorage.getItem('offline_message_queue');
    if (savedQueue) {
      try {
        setMessageQueue(JSON.parse(savedQueue));
      } catch (error) {
        console.error('Failed to load offline message queue:', error);
      }
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('offline_message_queue', JSON.stringify(messageQueue));
  }, [messageQueue]);

  // Process queue when coming back online
  useEffect(() => {
    if (isOnline && messageQueue.length > 0 && !isProcessing) {
      processMessageQueue();
    }
  }, [isOnline, messageQueue.length]);

  const addToQueue = (conversationId: string, content: string) => {
    const queuedMessage: QueuedMessage = {
      id: crypto.randomUUID(),
      conversationId,
      content,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    setMessageQueue(prev => [...prev, queuedMessage]);
    
    toast({
      title: "Message queued",
      description: "Your message will be sent when connection is restored",
    });
  };

  const processMessageQueue = async () => {
    if (!isOnline || messageQueue.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      for (const message of messageQueue) {
        try {
          // Here you would integrate with your actual message sending logic
          console.log('Sending queued message:', message);
          
          // Remove from queue on success
          setMessageQueue(prev => prev.filter(m => m.id !== message.id));
          
          toast({
            title: "Message sent",
            description: "Queued message has been delivered",
          });
        } catch (error) {
          // Increment retry count
          setMessageQueue(prev => 
            prev.map(m => 
              m.id === message.id 
                ? { ...m, retryCount: m.retryCount + 1 }
                : m
            )
          );
          
          // Remove from queue if max retries reached
          if (message.retryCount >= 3) {
            setMessageQueue(prev => prev.filter(m => m.id !== message.id));
            toast({
              title: "Message failed",
              description: "Failed to send message after multiple attempts",
              variant: "destructive",
            });
          }
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const clearQueue = () => {
    setMessageQueue([]);
    localStorage.removeItem('offline_message_queue');
  };

  return {
    messageQueue,
    isProcessing,
    isOnline,
    addToQueue,
    clearQueue
  };
};
