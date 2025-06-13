
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Mic } from 'lucide-react';

interface EnhancedMessageInputProps {
  conversationId: string;
  onSendMessage: (content: string, messageType?: string, options?: any) => Promise<void>;
  onSendVoiceMessage: (audioUrl: string, duration: number) => Promise<void>;
  onFileSelect: (file: File) => Promise<void>;
  placeholder?: string;
}

const EnhancedMessageInput = ({
  conversationId,
  onSendMessage,
  onSendVoiceMessage,
  onFileSelect,
  placeholder = "Type your message..."
}: EnhancedMessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    await onSendMessage(message.trim());
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Voice recording implementation would go here
  };

  return (
    <div className="border-t p-4 bg-white">
      <div className="flex gap-2 items-end">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileUpload}
          accept="image/*,audio/*,.pdf,.doc,.docx"
        />
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        <div className="flex-1">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="resize-none"
          />
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={toggleRecording}
          className={isRecording ? 'bg-red-100 text-red-600' : ''}
        >
          <Mic className="w-4 h-4" />
        </Button>

        <Button 
          onClick={handleSend}
          disabled={!message.trim()}
          size="icon"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default EnhancedMessageInput;
