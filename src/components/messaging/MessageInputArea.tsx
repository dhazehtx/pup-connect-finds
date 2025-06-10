
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  MicOff, 
  Image as ImageIcon,
  File,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import EmojiPicker from './EmojiPicker';
import VoiceRecorder from './VoiceRecorder';
import { useFileUpload } from '@/hooks/useFileUpload';

interface MessageInputAreaProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  uploading: boolean;
  sendingMessage: boolean;
  onSendMessage: () => void;
  onSendVoiceMessage: (audioUrl: string, duration: number) => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (event: React.KeyboardEvent) => void;
  sendMessage: (conversationId: string, content: string, messageType?: string, imageUrl?: string) => Promise<any>;
  conversationId: string;
}

const MessageInputArea = ({
  newMessage,
  setNewMessage,
  selectedFile,
  setSelectedFile,
  uploading,
  sendingMessage,
  onSendMessage,
  onSendVoiceMessage,
  onFileSelect,
  onKeyPress,
  sendMessage,
  conversationId
}: MessageInputAreaProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploadFile } = useFileUpload();

  const handleFileUpload = async (file: File) => {
    if (file.type.startsWith('image/')) {
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        await sendMessage(conversationId, `Shared an image: ${file.name}`, 'image', imageUrl);
      }
    } else {
      const fileUrl = await uploadFile(file);
      if (fileUrl) {
        await sendMessage(conversationId, `Shared a file: ${file.name}`, 'file', fileUrl);
      }
    }
    setSelectedFile(null);
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(newMessage + emoji);
    setShowEmojiPicker(false);
  };

  const canSend = (newMessage.trim() || selectedFile) && !sendingMessage && !uploading;

  return (
    <div className="p-4 border-t bg-background">
      {/* File Preview */}
      {selectedFile && (
        <div className="mb-3 p-3 bg-muted rounded-lg flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFile(null)}
          >
            <X size={16} />
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Attachment Button */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <File size={20} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading}
          >
            <ImageIcon size={20} />
          </Button>
        </div>

        {/* Message Input */}
        <div className="flex-1 relative">
          {newMessage.split('\n').length > 1 ? (
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="min-h-[40px] max-h-32 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
            />
          ) : (
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={onKeyPress}
              className="pr-10"
            />
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={20} />
          </Button>
        </div>

        {/* Voice Recording */}
        <VoiceRecorder
          onSendVoiceMessage={onSendVoiceMessage}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
        />

        {/* Send Button */}
        <Button
          onClick={canSend ? onSendMessage : undefined}
          disabled={!canSend}
          size="icon"
          className={cn(
            "transition-all",
            canSend 
              ? "bg-primary hover:bg-primary/90" 
              : "bg-muted-foreground/20"
          )}
        >
          <Send size={20} />
        </Button>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 right-4 z-50">
          <EmojiPicker
            onEmojiSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setSelectedFile(file);
          }
        }}
      />
      
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setSelectedFile(file);
          }
        }}
      />
    </div>
  );
};

export default MessageInputArea;
