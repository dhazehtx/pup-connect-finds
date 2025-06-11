
import React, { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  onSendMessage: (content: string, messageType?: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MessageInput = ({ 
  onSendMessage, 
  placeholder = "Type a message...", 
  disabled = false 
}: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      await onSendMessage(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-white p-4">
      <div className="flex items-end space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className="mb-2"
          disabled={disabled}
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || sending}
            className="min-h-[40px] max-h-32 resize-none"
            rows={1}
          />
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="mb-2"
          disabled={disabled}
        >
          <Smile className="w-4 h-4" />
        </Button>
        
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled || sending}
          size="icon"
          className="mb-2"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
