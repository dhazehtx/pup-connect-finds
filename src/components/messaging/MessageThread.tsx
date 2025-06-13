
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessageThreadProps {
  parentMessage: any;
  onClose: () => void;
  conversationId: string;
}

const MessageThread = ({ parentMessage, onClose, conversationId }: MessageThreadProps) => {
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<any[]>([]);

  const handleSendReply = () => {
    if (!replyText.trim()) return;

    const newReply = {
      id: Date.now().toString(),
      content: replyText,
      sender_id: 'current_user',
      created_at: new Date().toISOString()
    };

    setReplies([...replies, newReply]);
    setReplyText('');
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Thread</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        {/* Parent message */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-1">Original message:</p>
          <p className="text-sm">{parentMessage.content}</p>
        </div>

        {/* Thread replies */}
        <ScrollArea className="flex-1">
          <div className="space-y-3">
            {replies.map((reply) => (
              <div key={reply.id} className="p-2 border rounded-lg">
                <p className="text-sm">{reply.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(reply.created_at).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Reply input */}
        <div className="flex gap-2">
          <Input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Reply to thread..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendReply();
              }
            }}
          />
          <Button size="sm" onClick={handleSendReply} disabled={!replyText.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageThread;
