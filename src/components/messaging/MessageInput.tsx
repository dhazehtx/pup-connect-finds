
import React, { useState, useRef } from 'react';
import { Send, Paperclip, Image, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFileUpload } from '@/hooks/useFileUpload';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'text' | 'image' | 'file') => void;
  onSendFile: (file: File) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MessageInput = ({ 
  onSendMessage, 
  onSendFile, 
  disabled = false,
  placeholder = "Type a message..." 
}: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useFileUpload({
    bucket: 'images',
    folder: 'messages',
    maxSize: 10
  });

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendFile(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (!isTyping && e.target.value) {
      setIsTyping(true);
    } else if (isTyping && !e.target.value) {
      setIsTyping(false);
    }
  };

  return (
    <div className="border-t bg-white p-4">
      <div className="flex items-end gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,application/pdf,.doc,.docx"
          className="hidden"
        />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="shrink-0"
        >
          <Paperclip size={20} />
        </Button>

        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "Connecting..." : placeholder}
            disabled={disabled}
            className={cn(
              "pr-12 resize-none",
              isTyping && "border-blue-500"
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2"
          >
            <Smile size={16} />
          </Button>
        </div>

        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isUploading}
          size="icon"
          className="shrink-0"
        >
          <Send size={16} />
        </Button>
      </div>
      
      {isUploading && (
        <div className="mt-2 text-sm text-gray-500">
          Uploading file...
        </div>
      )}
    </div>
  );
};

export default MessageInput;
