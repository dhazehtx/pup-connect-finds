
import React, { useState, useEffect, useCallback } from 'react';
import { useTypingIndicators } from '@/hooks/useTypingIndicators';

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
  const [isCurrentUserTyping, setIsCurrentUserTyping] = useState(false);
  const { typingUsers, startTyping, stopTyping, getTypingUsers } = useTypingIndicators();

  const conversationTypingUsers = getTypingUsers(conversationId).filter(
    user => user.user_id !== currentUserId
  );

  const onTypingStart = useCallback(() => {
    if (!isCurrentUserTyping) {
      setIsCurrentUserTyping(true);
      startTyping(conversationId);
      onTyping?.(true);
    }
  }, [isCurrentUserTyping, startTyping, conversationId, onTyping]);

  const onTypingStop = useCallback(() => {
    if (isCurrentUserTyping) {
      setIsCurrentUserTyping(false);
      stopTyping(conversationId);
      onTyping?.(false);
    }
  }, [isCurrentUserTyping, stopTyping, conversationId, onTyping]);

  // Auto-stop typing after 3 seconds of inactivity
  useEffect(() => {
    if (isCurrentUserTyping) {
      const timeout = setTimeout(onTypingStop, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isCurrentUserTyping, onTypingStop]);

  const typingIndicator = conversationTypingUsers.length > 0 ? (
    <div className="px-4 py-2 text-sm text-muted-foreground animate-pulse">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span>
          {conversationTypingUsers.map(u => u.username).join(', ')} {conversationTypingUsers.length === 1 ? 'is' : 'are'} typing...
        </span>
      </div>
    </div>
  ) : null;

  return {
    onTypingStart,
    onTypingStop,
    typingIndicator
  };
};

export default MessageTypingIndicator;
