import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  Shield, 
  ShieldOff,
  Image,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { useMessageEncryption } from '@/hooks/useMessageEncryption';
import VoiceMessageRecorder from './VoiceMessageRecorder';
import { useToast } from '@/hooks/use-toast';

interface EnhancedMessageInputProps {
  onSendMessage: (content: string, messageType?: string, options?: any) => void;
  onSendVoiceMessage?: (audioBlob: Blob, duration: number) => void;
  onFileSelect?: (file: File) => void;
  disabled?: boolean;
  placeholder?: string;
  showEncryption?: boolean;
}

const EnhancedMessageInput = ({
  onSendMessage,
  onSendVoiceMessage,
  onFileSelect,
  disabled = false,
  placeholder = "Type your message...",
  showEncryption = true
}: EnhancedMessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isEncryptionEnabled, setIsEncryptionEnabled] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { encryptMessage, isEncrypting } = useMessageEncryption();
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!message.trim() || disabled) return;

    try {
      let messageOptions: any = {
        isEncrypted: isEncryptionEnabled,
        isScheduled: isScheduled
      };

      if (isEncryptionEnabled) {
        const encryptionResult = await encryptMessage(message);
        if (encryptionResult) {
          messageOptions.encryptedContent = encryptionResult.encryptedContent;
          messageOptions.encryptionKeyId = encryptionResult.keyId;
        } else {
          toast({
            title: "Encryption failed",
            description: "Sending message without encryption",
            variant: "destructive",
          });
        }
      }

      await onSendMessage(message, 'text', messageOptions);
      setMessage('');
      setIsScheduled(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleVoiceMessage = (audioBlob: Blob, duration: number) => {
    if (onSendVoiceMessage) {
      onSendVoiceMessage(audioBlob, duration);
    }
    setShowVoiceRecorder(false);
  };

  const emojiOptions = ['😀', '😂', '❤️', '👍', '👎', '😢', '😮', '😡'];

  return (
    <div className="border-t bg-background p-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
      />
      
      {showVoiceRecorder ? (
        <VoiceMessageRecorder
          onSendVoiceMessage={handleVoiceMessage}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      ) : (
        <div className="flex gap-2 items-end">
          {/* File Upload Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleFileUpload}
            disabled={disabled}
            className="flex-shrink-0"
          >
            <Paperclip size={16} />
          </Button>

          {/* Main Input Area */}
          <div className="flex-1 space-y-2">
            {/* Encryption & Schedule Status */}
            {(isEncryptionEnabled || isScheduled) && (
              <div className="flex gap-2">
                {isEncryptionEnabled && (
                  <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <Shield size={12} />
                    Encrypted
                  </div>
                )}
                {isScheduled && (
                  <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    <Calendar size={12} />
                    Scheduled
                  </div>
                )}
              </div>
            )}

            {/* Message Input */}
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled || isEncrypting}
              className="min-h-[44px] max-h-32 resize-none"
              rows={1}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1 flex-shrink-0">
            {/* Emoji Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" disabled={disabled}>
                  <Smile size={16} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="grid grid-cols-8 gap-1">
                  {emojiOptions.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      onClick={() => setMessage(prev => prev + emoji)}
                      className="h-8 w-8 p-0"
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Voice Message */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowVoiceRecorder(true)}
              disabled={disabled}
            >
              <Mic size={16} />
            </Button>

            {/* More Options */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" disabled={disabled}>
                  <MoreHorizontal size={16} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-2">
                  {showEncryption && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEncryptionEnabled(!isEncryptionEnabled)}
                      className="w-full justify-start"
                    >
                      {isEncryptionEnabled ? <Shield size={16} /> : <ShieldOff size={16} />}
                      <span className="ml-2">
                        {isEncryptionEnabled ? 'Disable' : 'Enable'} Encryption
                      </span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsScheduled(!isScheduled)}
                    className="w-full justify-start"
                  >
                    <Calendar size={16} />
                    <span className="ml-2">Schedule Message</span>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || disabled || isEncrypting}
              size="icon"
              className="flex-shrink-0"
            >
              {isEncrypting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMessageInput;
