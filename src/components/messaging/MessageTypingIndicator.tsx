
import React, { useState, useEffect } from 'react';
import { useRealtimeTyping } from '@/hooks/useRealtimeTyping';

interface MessageTypingIndicatorProps {
  conversationId: string;
  currentUserId: string;
  onTyping?: (isTyping: boolean) => void;
}

const MessageTypingIndicator = ({ 
  conversationId, 
  currentUserId, 
  onTyping 
}: MessageTypingIndicatorProps) => {
  const [isTyping, setIsTyping] = useState(false);
  const { typingUsers, sendTypingIndicator, setupTypingSubscription } = useRealtimeTyping();

  useEffect(() => {
    const cleanup = setupTypingSubscription(conversationId);
    return cleanup;
  }, [conversationId, setupTypingSubscription]);

  useEffect(() => {
    onTyping?.(isTyping);
    
    if (isTyping) {
      sendTypingIndicator(conversationId, true);
      
      const timeout = setTimeout(() => {
        setIsTyping(false);
        sendTypingIndicator(conversationId, false);
      }, 3000);
      
      return () => clearTimeout(timeout);
    } else {
      sendTypingIndicator(conversationId, false);
    }
  }, [isTyping, conversationId, sendTypingIndicator, onTyping]);

  const handleTypingStart = () => setIsTyping(true);
  const handleTypingStop = () => setIsTyping(false);

  const otherUsersTyping = Array.from(typingUsers).filter(userId => userId !== currentUserId);

  return {
    onTypingStart: handleTypingStart,
    onTypingStop: handleTypingStop,
    typingIndicator: otherUsersTyping.length > 0 && (
      <div className="flex justify-start px-4 py-2">
        <div className="bg-muted text-muted-foreground px-3 py-2 rounded-lg">
          <div className="flex items-center gap-1">
            <div className="flex space-x-1">
              <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <span className="text-xs ml-2">typing...</span>
          </div>
        </div>
      </div>
    )
  };
};

export default MessageTypingIndicator;
