
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Send, Paperclip, Mic } from 'lucide-react';
import AdvancedVoiceRecorder from '../AdvancedVoiceRecorder';

interface ChatInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  uploading: boolean;
  isEncrypted: boolean;
  showVoiceRecorder: boolean;
  setShowVoiceRecorder: (show: boolean) => void;
  onSendMessage: () => void;
  onSendVoiceMessage: (audioUrl: string, duration: number) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const ChatInput = ({
  newMessage,
  setNewMessage,
  selectedFile,
  setSelectedFile,
  uploading,
  isEncrypted,
  showVoiceRecorder,
  setShowVoiceRecorder,
  onSendMessage,
  onSendVoiceMessage,
  onKeyPress
}: ChatInputProps) => {
  return (
    <div className="p-4">
      {selectedFile && (
        <div className="mb-2 p-2 bg-muted rounded flex items-center justify-between">
          <span className="text-sm">{selectedFile.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFile(null)}
          >
            ×
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={onKeyPress}
          placeholder={isEncrypted ? "Type an encrypted message..." : "Type a message..."}
          className="flex-1"
          disabled={uploading}
        />
        
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button variant="ghost" size="sm" asChild>
            <span>
              <Paperclip className="w-4 h-4" />
            </span>
          </Button>
        </label>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowVoiceRecorder(true)}
        >
          <Mic className="w-4 h-4" />
        </Button>
        
        <Button 
          size="sm" 
          onClick={onSendMessage}
          disabled={(!newMessage.trim() && !selectedFile) || uploading}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Voice Recorder Modal */}
      <Popover open={showVoiceRecorder} onOpenChange={setShowVoiceRecorder}>
        <PopoverTrigger asChild>
          <div />
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0">
          <AdvancedVoiceRecorder
            onSendVoiceMessage={onSendVoiceMessage}
            onCancel={() => setShowVoiceRecorder(false)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ChatInput;
