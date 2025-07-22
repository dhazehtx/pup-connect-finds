
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface MessageNotificationsProps {
  newMessage?: any;
}

const MessageNotifications = ({ newMessage }: MessageNotificationsProps) => {
  const { toast } = useToast();

  useEffect(() => {
    if (newMessage) {
      toast({
        title: "New Message",
        description: newMessage.content.substring(0, 50) + (newMessage.content.length > 50 ? "..." : ""),
      });
    }
  }, [newMessage, toast]);

  return null; // This is a notification component, no UI needed
};

export default MessageNotifications;
