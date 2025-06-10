
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EnhancedMessageInput from './EnhancedMessageInput';

interface MessageInputAreaProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  uploading: boolean;
  sendingMessage: boolean;
  onSendMessage: () => void;
  onSendVoiceMessage: (audioBlob: Blob, duration: number) => void;
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
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border-t bg-background">
      {/* File Preview */}
      {selectedFile && (
        <div className="px-4 py-2 bg-muted/50 border-t">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground flex-1 truncate">
              Selected: {selectedFile.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="h-6 px-2 text-xs"
            >
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4">
        <div className="flex gap-2 items-end">
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileSelect}
            accept="image/*"
            className="hidden"
          />
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || sendingMessage}
            className="flex-shrink-0"
          >
            <Image size={16} />
          </Button>

          <div className="flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder={t('messaging.typeMessage') || 'Type your message...'}
              disabled={uploading || sendingMessage}
              className="resize-none"
            />
          </div>

          {/* Voice Message Button */}
          <EnhancedMessageInput
            onSendMessage={(content, messageType, options) => 
              sendMessage(conversationId, content, messageType || 'text', options?.imageUrl)
            }
            onSendVoiceMessage={onSendVoiceMessage}
            onFileSelect={(file) => setSelectedFile(file)}
            disabled={uploading || sendingMessage}
            placeholder={t('messaging.typeMessage') || 'Type your message...'}
            showEncryption={false}
          />

          <Button
            onClick={onSendMessage}
            disabled={(!newMessage.trim() && !selectedFile) || uploading || sendingMessage}
            className="flex-shrink-0"
          >
            {sendingMessage ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageInputArea;
