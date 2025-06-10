
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, X } from 'lucide-react';
import { useMessageThreads } from '@/hooks/useMessageThreads';
import { useAuth } from '@/contexts/AuthContext';

interface MessageThreadProps {
  parentMessageId: string;
  isOpen: boolean;
  onClose: () => void;
  parentMessage: any;
}

const MessageThread = ({
  parentMessageId,
  isOpen,
  onClose,
  parentMessage
}: MessageThreadProps) => {
  const [newReply, setNewReply] = useState('');
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { threads, fetchThreadMessages, sendThreadReply } = useMessageThreads();

  const threadMessages = threads[parentMessageId] || [];

  useEffect(() => {
    if (isOpen && parentMessageId) {
      fetchThreadMessages(parentMessageId);
    }
  }, [isOpen, parentMessageId, fetchThreadMessages]);

  const handleSendReply = async () => {
    if (!newReply.trim() || sending) return;

    try {
      setSending(true);
      await sendThreadReply(parentMessageId, newReply);
      setNewReply('');
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Thread</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={16} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Parent Message */}
        <div className="border-b pb-3">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm">{parentMessage?.content}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Original message
            </p>
          </div>
        </div>

        {/* Thread Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 py-3">
          {threadMessages.map((message) => {
            const isOwn = message.sender_id === user?.id;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${isOwn ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`p-2 rounded-lg text-sm ${
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>
                  <p className={`text-xs text-muted-foreground mt-1 ${
                    isOwn ? 'text-right' : 'text-left'
                  }`}>
                    {message.sender_name || 'Unknown'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply Input */}
        <div className="border-t pt-3">
          <div className="flex gap-2">
            <Input
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Reply to thread..."
              onKeyPress={handleKeyPress}
              disabled={sending}
            />
            <Button
              onClick={handleSendReply}
              disabled={!newReply.trim() || sending}
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
