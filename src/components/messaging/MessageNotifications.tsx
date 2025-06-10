
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface MessageNotificationsProps {
  newMessage?: {
    id: string;
    sender_id: string;
    content: string;
    conversation_id: string;
    sender_name?: string;
  };
}

const MessageNotifications = ({ newMessage }: MessageNotificationsProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (newMessage && newMessage.sender_id !== user?.id) {
      // Request notification permission if not granted
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`New message from ${newMessage.sender_name || 'Unknown'}`, {
          body: newMessage.content.substring(0, 100),
          icon: '/favicon.ico',
          tag: newMessage.conversation_id,
        });
      }

      // Show toast notification
      toast({
        title: `New message from ${newMessage.sender_name || 'Unknown'}`,
        description: newMessage.content.substring(0, 100),
      });
    }
  }, [newMessage, user, toast]);

  return null; // This component doesn't render anything
};

export default MessageNotifications;
