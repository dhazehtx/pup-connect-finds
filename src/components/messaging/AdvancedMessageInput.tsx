
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Send, Paperclip, Smile, Clock, Mic, Image } from 'lucide-react';
import MessageSchedulerNew from './MessageSchedulerNew';
import EnhancedFileShare from './EnhancedFileShare';
import { useToast } from '@/hooks/use-toast';

interface AdvancedMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (content: string) => void;
  onFileUpload: (files: File[]) => void;
  conversationId: string;
  placeholder?: string;
  disabled?: boolean;
}

const AdvancedMessageInput = ({
  value,
  onChange,
  onSend,
  onFileUpload,
  conversationId,
  placeholder = "Type your message...",
  disabled = false
}: AdvancedMessageInputProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileShare, setShowFileShare] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + emoji + value.substring(end);
    
    onChange(newValue);
    
    // Set cursor position after emoji
    setTimeout(() => {
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      textarea.focus();
    }, 0);
    
    setShowEmojiPicker(false);
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      toast({
        title: "Voice recording",
        description: "Voice recording feature coming soon!",
      });
    } else {
      setIsRecording(true);
      // Simulate recording
      setTimeout(() => setIsRecording(false), 3000);
    }
  };

  const handleScheduledMessage = (message: any) => {
    toast({
      title: "Message scheduled",
      description: "Your message has been scheduled successfully",
    });
  };

  const handleFilesUpload = (uploads: any[]) => {
    const files = uploads.map(upload => upload.file);
    onFileUpload(files);
  };

  const EMOJI_SHORTCUTS = ['😀', '😂', '❤️', '👍', '🎉', '🤔', '😢', '🔥'];

  return (
    <div className="border rounded-lg bg-background">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className="border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
        rows={3}
      />
      
      <div className="flex items-center justify-between p-3 border-t">
        <div className="flex items-center gap-1">
          {/* File Upload */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFileShare(true)}
            disabled={disabled}
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          {/* Image Upload */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFileShare(true)}
            disabled={disabled}
          >
            <Image className="w-4 h-4" />
          </Button>

          {/* Emoji Picker */}
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" disabled={disabled}>
                <Smile className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="grid grid-cols-4 gap-1">
                {EMOJI_SHORTCUTS.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => insertEmoji(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Voice Recording */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVoiceRecord}
            disabled={disabled}
            className={isRecording ? 'text-red-500' : ''}
          >
            <Mic className="w-4 h-4" />
          </Button>

          {/* Message Scheduler */}
          <MessageSchedulerNew
            conversationId={conversationId}
            onSchedule={handleScheduledMessage}
          >
            <Button variant="ghost" size="sm" disabled={disabled}>
              <Clock className="w-4 h-4" />
            </Button>
          </MessageSchedulerNew>
        </div>

        <Button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          size="sm"
        >
          <Send className="w-4 h-4 mr-2" />
          Send
        </Button>
      </div>

      {/* File Share Dialog */}
      <EnhancedFileShare
        isOpen={showFileShare}
        onClose={() => setShowFileShare(false)}
        onFilesUpload={handleFilesUpload}
      />
    </div>
  );
};

export default AdvancedMessageInput;
