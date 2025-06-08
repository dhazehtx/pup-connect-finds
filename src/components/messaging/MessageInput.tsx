
import React, { useState } from 'react';
import { Send, Paperclip, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MessageInputProps {
  onSendMessage: (content: string, type?: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MessageInput = ({ onSendMessage, disabled = false, placeholder = "Type a message..." }: MessageInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t bg-white">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="p-2"
        disabled={disabled}
      >
        <Paperclip className="w-4 h-4" />
      </Button>
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="p-2"
        disabled={disabled}
      >
        <Image className="w-4 h-4" />
      </Button>

      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
      />

      <Button 
        type="submit" 
        size="sm"
        disabled={!message.trim() || disabled}
        className="px-4"
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
};

export default MessageInput;
