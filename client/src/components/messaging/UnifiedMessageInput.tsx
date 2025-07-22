
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Mic, FileText, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import MessageTemplates from './MessageTemplates';
import QuickReplies from './QuickReplies';

interface UnifiedMessageInputProps {
  conversationId: string;
  onSendMessage: (content: string, type?: string, options?: any) => void;
  onSendVoiceMessage?: (audioUrl: string, duration: number) => void;
  onFileSelect?: (file: File) => void;
  disabled?: boolean;
  placeholder?: string;
}

const UnifiedMessageInput: React.FC<UnifiedMessageInputProps> = ({
  conversationId,
  onSendMessage,
  onSendVoiceMessage,
  onFileSelect,
  disabled = false,
  placeholder = "Type your message..."
}) => {
  const [message, setMessage] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTemplateSelect = (content: string) => {
    setMessage(content);
    setShowTemplates(false);
  };

  const handleQuickReply = (reply: string) => {
    onSendMessage(reply);
    setShowQuickReplies(false);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording logic would go here
      setIsRecording(false);
    } else {
      // Start recording logic would go here
      setIsRecording(true);
    }
  };

  return (
    <div className="border-t bg-white p-4 space-y-3">
      {/* Quick Replies Toggle */}
      {showQuickReplies && (
        <QuickReplies onQuickReply={handleQuickReply} />
      )}

      {/* Main Input Area */}
      <div className="flex gap-2 items-end">
        {/* Templates Button */}
        <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="mb-1">
              <FileText size={16} />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <MessageTemplates onSelectTemplate={handleTemplateSelect} />
          </DialogContent>
        </Dialog>

        {/* File Upload */}
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
          onClick={handleFileUpload}
          className="mb-1"
        >
          <Paperclip size={16} />
        </Button>

        {/* Text Input */}
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="resize-none min-h-10 max-h-32"
          />
        </div>

        {/* Voice Recording */}
        <Button
          variant={isRecording ? "destructive" : "outline"}
          size="sm"
          onClick={toggleRecording}
          className="mb-1"
        >
          <Mic size={16} />
        </Button>

        {/* Send Button */}
        <Button 
          onClick={handleSend} 
          disabled={!message.trim() || disabled}
          className="mb-1"
        >
          <Send size={16} />
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowQuickReplies(!showQuickReplies)}
          className="text-xs"
        >
          <Zap size={12} className="mr-1" />
          Quick Replies
        </Button>
      </div>
    </div>
  );
};

export default UnifiedMessageInput;
