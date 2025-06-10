
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageSquare, Send, X, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useMessageThreads } from '@/hooks/useMessageThreads';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface MessageThreadProps {
  parentMessageId: string;
  isOpen: boolean;
  onClose: () => void;
  parentMessage: {
    content: string;
    sender_name?: string;
    created_at: string;
    sender_id: string;
  };
}

const MessageThread = ({ 
  parentMessageId, 
  isOpen, 
  onClose, 
  parentMessage 
}: MessageThreadProps) => {
  const [replyContent, setReplyContent] = useState('');
  const { user } = useAuth();
  const { threadMessages, fetchThreadMessages, sendThreadReply, getThreadCount } = useMessageThreads();

  const currentThreadMessages = threadMessages[parentMessageId] || [];
  const threadCount = getThreadCount(parentMessageId);

  useEffect(() => {
    if (isOpen && parentMessageId) {
      fetchThreadMessages(parentMessageId);
    }
  }, [isOpen, parentMessageId, fetchThreadMessages]);

  const handleSendReply = async () => {
    if (!replyContent.trim()) return;
    
    const result = await sendThreadReply(parentMessageId, replyContent.trim());
    if (result) {
      setReplyContent('');
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
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare size={20} />
            Thread
            {threadCount > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users size={14} />
                {threadCount} {threadCount === 1 ? 'reply' : 'replies'}
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} className="ml-auto">
              <X size={16} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Original Message */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-xs">
                    {parentMessage.sender_id === user?.id ? 'Me' : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">
                  {parentMessage.sender_name || 'Unknown User'}
                </span>
                <span className="text-xs text-muted-foreground">
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
            {currentThreadMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No replies yet. Be the first to reply!</p>
              </div>
            ) : (
              currentThreadMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender_id !== user?.id && (
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="text-xs">U</AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-xs rounded-lg px-3 py-2 ${
                      message.sender_id === user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center justify-between mt-1 text-xs opacity-70 ${
                      message.sender_id === user?.id ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      <span>{message.sender_name || 'Unknown'}</span>
                      <span>
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {message.sender_id === user?.id && (
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="text-xs">Me</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            )}
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
