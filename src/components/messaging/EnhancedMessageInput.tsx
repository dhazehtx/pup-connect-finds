
import React, { useState, useRef } from 'react';
import { Send, Paperclip, Image, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';

interface EnhancedMessageInputProps {
  conversationId: string;
  onSendMessage: (content: string, type?: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const EnhancedMessageInput = ({ 
  conversationId, 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type a message..." 
}: EnhancedMessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startTyping, stopTyping, otherUserTyping } = useTypingIndicator(conversationId);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    if (value.trim() && !isComposing) {
      setIsComposing(true);
      startTyping();
    } else if (!value.trim() && isComposing) {
      setIsComposing(false);
      stopTyping();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setIsComposing(false);
      stopTyping();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, just send the filename as a message
      onSendMessage(`📎 ${file.name}`, 'file');
    }
  };

  return (
    <div className="border-t bg-white">
      {otherUserTyping && (
        <div className="px-4 py-2 text-sm text-gray-500 border-b">
          <div className="flex items-center gap-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <span>typing...</span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx"
        />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleFileUpload}
          disabled={disabled}
          className="p-2"
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="p-2"
        >
          <Image className="w-4 h-4" />
        </Button>

        <Input
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
        />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="p-2"
        >
          <Smile className="w-4 h-4" />
        </Button>

        <Button 
          type="submit" 
          size="sm"
          disabled={!message.trim() || disabled}
          className="px-4"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default EnhancedMessageInput;
