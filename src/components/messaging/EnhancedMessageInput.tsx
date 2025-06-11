
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Send, Paperclip, Mic, Image, Smile } from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';
import EnhancedFileShare from './EnhancedFileShare';
import { useUnifiedFileUpload } from '@/hooks/useUnifiedFileUpload';
import { useToast } from '@/hooks/use-toast';

interface EnhancedMessageInputProps {
  conversationId: string;
  onSendMessage: (content: string, messageType?: string, options?: any) => void;
  onSendVoiceMessage: (audioUrl: string, duration: number) => void;
  onFileSelect?: (file: File) => void;
  placeholder?: string;
  disabled?: boolean;
}

const EnhancedMessageInput = ({
  conversationId,
  onSendMessage,
  onSendVoiceMessage,
  onFileSelect,
  placeholder = "Type your message...",
  disabled = false
}: EnhancedMessageInputProps) => {
  const [message, setMessage] = useState('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showFileShare, setShowFileShare] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadImage, uploading } = useUnifiedFileUpload({
    bucket: 'message-files',
    folder: 'images',
    maxSize: 50 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  });

  const { toast } = useToast();

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    onSendMessage(message);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceMessage = (audioUrl: string, duration: number) => {
    onSendVoiceMessage(audioUrl, duration);
    setShowVoiceRecorder(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        onSendMessage(`Shared an image: ${file.name}`, 'image', { imageUrl });
        toast({
          title: "Image sent",
          description: "Your image was shared successfully",
        });
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFilesUpload = (files: any[]) => {
    files.forEach(fileUpload => {
      if (fileUpload.url) {
        const fileType = fileUpload.file.type.startsWith('image/') ? 'image' : 'file';
        onSendMessage(
          `Shared ${fileType === 'image' ? 'an image' : 'a file'}: ${fileUpload.file.name}`, 
          fileType, 
          { 
            imageUrl: fileUpload.url,
            fileName: fileUpload.file.name,
            fileSize: fileUpload.file.size,
            fileType: fileUpload.file.type
          }
        );
      }
    });
    setShowFileShare(false);
  };

  return (
    <div className="border-t bg-background p-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || uploading}
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
        </div>

        <div className="flex items-center gap-1">
          {/* Image upload */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
          >
            <Image size={20} />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* File share */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFileShare(true)}
            disabled={disabled}
          >
            <Paperclip size={20} />
          </Button>

          {/* Voice recorder */}
          <Popover open={showVoiceRecorder} onOpenChange={setShowVoiceRecorder}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={disabled}
              >
                <Mic size={20} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <VoiceRecorder
                onSendVoiceMessage={handleVoiceMessage}
                isRecording={isRecording}
                setIsRecording={setIsRecording}
                onCancel={() => setShowVoiceRecorder(false)}
              />
            </PopoverContent>
          </Popover>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled || uploading}
            size="icon"
          >
            <Send size={20} />
          </Button>
        </div>
      </div>

      {/* Enhanced File Share Dialog */}
      <EnhancedFileShare
        isOpen={showFileShare}
        onClose={() => setShowFileShare(false)}
        onFilesUpload={handleFilesUpload}
        maxFiles={5}
        maxSize={50}
        acceptedTypes={[
          'image/jpeg', 'image/png', 'image/webp', 'image/gif',
          'video/mp4', 'video/webm',
          'application/pdf', 'text/plain'
        ]}
      />
    </div>
  );
};

export default EnhancedMessageInput;
