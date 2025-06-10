
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Paperclip, Mic, Image, Smile } from 'lucide-react';
import { useTypingIndicators } from '@/hooks/useTypingIndicators';
import { useEnhancedFileUpload } from '@/hooks/useEnhancedFileUpload';
import EmojiPicker from './EmojiPicker';

interface EnhancedMessageInputProps {
  conversationId: string;
  onSendMessage: (content: string, type?: string, fileUrl?: string) => void;
  onSendVoiceMessage?: (audioUrl: string, duration: number) => void;
  placeholder?: string;
}

const EnhancedMessageInput = ({
  conversationId,
  onSendMessage,
  onSendVoiceMessage,
  placeholder = "Type a message..."
}: EnhancedMessageInputProps) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const { startTyping, stopTyping } = useTypingIndicators();
  const { uploading, uploadProgress, uploadFile, uploadImage, uploadAudio } = useEnhancedFileUpload();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    if (value.length === 1) {
      startTyping(conversationId);
    } else if (value.length === 0) {
      stopTyping(conversationId);
    }
  };

  const handleSend = async () => {
    if (!message.trim() && !selectedFile) return;
    
    stopTyping(conversationId);
    
    if (selectedFile) {
      try {
        const fileUrl = await uploadFile(selectedFile);
        onSendMessage(message || `Shared ${selectedFile.name}`, 'file', fileUrl);
      } catch (error) {
        console.error('File upload failed:', error);
      }
      setSelectedFile(null);
    } else {
      onSendMessage(message, 'text');
    }
    
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imageUrl = await uploadImage(file);
        onSendMessage(message || 'Shared an image', 'image', imageUrl);
        setMessage('');
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
          const audioUrl = await uploadAudio(audioBlob);
          if (onSendVoiceMessage) {
            onSendVoiceMessage(audioUrl, 0); // Duration calculation can be added later
          } else {
            onSendMessage('Voice message', 'voice', audioUrl);
          }
        } catch (error) {
          console.error('Voice upload failed:', error);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting voice recording:', error);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="relative">
      {/* File preview */}
      {selectedFile && (
        <Card className="p-3 mb-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">{selectedFile.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFile(null)}
            >
              ×
            </Button>
          </div>
          {uploading && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </Card>
      )}

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-full mb-2 left-0 z-50">
          <EmojiPicker
            onEmojiSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}

      <div className="flex items-center gap-2 p-3 border-t bg-background">
        {/* File upload button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Paperclip size={20} />
        </Button>

        {/* Image upload button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => imageInputRef.current?.click()}
          disabled={uploading}
        >
          <Image size={20} />
        </Button>

        {/* Emoji button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Smile size={20} />
        </Button>

        {/* Message input */}
        <Input
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1"
          disabled={uploading}
        />

        {/* Voice recording button */}
        <Button
          variant="ghost"
          size="icon"
          onMouseDown={startVoiceRecording}
          onMouseUp={stopVoiceRecording}
          onMouseLeave={stopVoiceRecording}
          className={isRecording ? 'bg-red-100' : ''}
        >
          <Mic size={20} className={isRecording ? 'text-red-500' : ''} />
        </Button>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() && !selectedFile || uploading}
          size="icon"
        >
          <Send size={16} />
        </Button>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />
      </div>
    </div>
  );
};

export default EnhancedMessageInput;
