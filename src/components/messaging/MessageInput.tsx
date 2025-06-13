
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Camera } from 'lucide-react';

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const MessageInput = ({ 
  newMessage, 
  setNewMessage, 
  onSendMessage, 
  onKeyPress 
}: MessageInputProps) => {
  return (
    <div className="border-t p-4 bg-white">
      <div className="flex gap-2">
        <Button variant="outline" size="icon">
          <Camera size={16} />
        </Button>
        
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button 
          onClick={onSendMessage}
          disabled={!newMessage.trim()}
          size="icon"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
