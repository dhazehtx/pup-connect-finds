
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Smile, 
  Image as ImageIcon,
  File as FileIcon,
  X
} from 'lucide-react';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useUnifiedFileUpload } from '@/hooks/useUnifiedFileUpload';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EnhancedMessageInputProps {
  conversationId: string;
  onSendMessage: (content: string, messageType?: string, options?: any) => void;
  onSendVoiceMessage: (audioUrl: string, duration: number) => void;
  onFileSelect: (file: File) => void;
  placeholder?: string;
  disabled?: boolean;
}

const EnhancedMessageInput = ({
  conversationId,
  onSendMessage,
  onSendVoiceMessage,
  onFileSelect,
  placeholder = "Type a message...",
  disabled = false
}: EnhancedMessageInputProps) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { uploading, progress } = useUnifiedFileUpload({
    bucket: 'message-files',
    folder: 'attachments',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/*', 'application/pdf', 'text/*', 'audio/*', 'video/*']
  });

  const {
    isRecording,
    duration,
    audioUrl,
    startRecording,
    stopRecording,
    clearRecording
  } = useVoiceRecording({
    onRecordingComplete: (audioBlob, duration) => {
      // Convert blob to URL and send
      const url = URL.createObjectURL(audioBlob);
      onSendVoiceMessage(url, duration);
    },
    maxDuration: 120 // 2 minutes max
  });

  const handleSendMessage = () => {
    if (!message.trim() && !selectedFile) return;

    if (selectedFile) {
      onFileSelect(selectedFile);
      setSelectedFile(null);
    }

    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border-t p-4 bg-background">
      {/* File Upload Progress */}
      {uploading && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
            <span>Uploading file...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="mb-2 p-2 bg-muted rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileIcon className="w-4 h-4" />
            <span className="text-sm truncate">{selectedFile.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFile(null)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Voice Recording Preview */}
      {audioUrl && (
        <div className="mb-2 p-2 bg-muted rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            <span className="text-sm">Voice message ({formatDuration(duration)})</span>
            <audio controls src={audioUrl} className="h-6" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearRecording}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Attachment Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={disabled}>
              <Paperclip className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Photo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <FileIcon className="w-4 h-4 mr-2" />
              Document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Message Input */}
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || uploading}
            className="pr-10"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            disabled={disabled}
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>

        {/* Voice Recording Button */}
        <Button
          variant={isRecording ? "destructive" : "ghost"}
          size="sm"
          onClick={handleVoiceToggle}
          disabled={disabled}
          className={isRecording ? "animate-pulse" : ""}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {isRecording && (
            <span className="ml-1 text-xs">{formatDuration(duration)}</span>
          )}
        </Button>

        {/* Send Button */}
        <Button 
          onClick={handleSendMessage} 
          disabled={!message.trim() && !selectedFile && !audioUrl || disabled || uploading}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
      />
      <input
        ref={imageInputRef}
        type="file"
        hidden
        onChange={handleFileChange}
        accept="image/*,video/*"
      />
    </div>
  );
};

export default EnhancedMessageInput;
