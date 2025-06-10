
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageSquare, Send, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface ThreadMessage {
  id: string;
  parent_message_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
}

interface MessageThreadProps {
  parentMessageId: string;
  isOpen: boolean;
  onClose: () => void;
  onSendReply: (parentMessageId: string, content: string) => void;
  threadMessages: ThreadMessage[];
  parentMessage: {
    content: string;
    sender_name?: string;
    created_at: string;
  };
}

const MessageThread = ({ 
  parentMessageId, 
  isOpen, 
  onClose, 
  onSendReply, 
  threadMessages, 
  parentMessage 
}: MessageThreadProps) => {
  const [replyContent, setReplyContent] = useState('');
  const { user } = useAuth();

  const handleSendReply = () => {
    if (!replyContent.trim()) return;
    onSendReply(parentMessageId, replyContent.trim());
    setReplyContent('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare size={20} />
            Thread
            <Button variant="ghost" size="sm" onClick={onClose} className="ml-auto">
              <X size={16} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Original Message */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">
                  {parentMessage.sender_name || 'Unknown User'}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(parentMessage.created_at), { addSuffix: true })}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm">{parentMessage.content}</p>
            </CardContent>
          </Card>

          {/* Thread Replies */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {threadMessages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs rounded-lg px-3 py-2 ${
                    message.sender_id === user?.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-70">
                      {message.sender_name || 'Unknown'}
                    </span>
                    <span className="text-xs opacity-70">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Input */}
          <div className="flex gap-2">
            <Input
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Reply to thread..."
              className="flex-1"
            />
            <Button 
              onClick={handleSendReply}
              disabled={!replyContent.trim()}
              size="icon"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageThread;
