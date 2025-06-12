
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Mic, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UnifiedMessageInputProps {
  conversationId: string;
  onSendMessage: (content: string, type?: string, options?: any) => Promise<void>;
  onSendVoiceMessage?: (audioUrl: string, duration: number) => void;
  onFileSelect?: (file: File) => void;
  placeholder?: string;
  disabled?: boolean;
}

const UnifiedMessageInput = ({
  conversationId,
  onSendMessage,
  onSendVoiceMessage,
  onFileSelect,
  placeholder = "Type your message...",
  disabled = false
}: UnifiedMessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!message.trim() || sendingMessage) return;

    try {
      setSendingMessage(true);
      await onSendMessage(message.trim());
      setMessage('');
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  const toggleRecording = () => {
    if (onSendVoiceMessage) {
      setIsRecording(!isRecording);
      // Voice recording logic would go here
      toast({
        title: "Voice messages",
        description: "Voice recording coming soon!",
      });
    }
  };

  return (
    <div className="border-t p-4 bg-white">
      <div className="flex items-end gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,document/*"
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleFileClick}
          disabled={disabled}
          className="shrink-0"
        >
          <Paperclip size={16} />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleFileClick}
          disabled={disabled}
          className="shrink-0"
        >
          <Image size={16} />
        </Button>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled || sendingMessage}
          className="flex-1 min-h-[44px] max-h-32 resize-none"
          rows={1}
        />

        <Button
          variant="outline"
          size="sm"
          onClick={toggleRecording}
          disabled={disabled}
          className={`shrink-0 ${isRecording ? 'bg-red-100 text-red-600' : ''}`}
        >
          <Mic size={16} />
        </Button>

        <Button
          onClick={handleSend}
          disabled={!message.trim() || sendingMessage || disabled}
          className="shrink-0"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
};

export default UnifiedMessageInput;
