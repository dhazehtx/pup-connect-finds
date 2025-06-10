
import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Reply, Forward, Copy, Download, Trash2 } from 'lucide-react';
import MessageReactionsNew from './MessageReactionsNew';
import MessageStatusIndicator from './MessageStatusIndicator';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MessageFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

interface AdvancedMessageBubbleProps {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  messageType?: 'text' | 'image' | 'file';
  imageUrl?: string;
  files?: MessageFile[];
  reactions?: any[];
  isOwn: boolean;
  readAt?: string;
  onReactionAdd: (messageId: string, emoji: string) => void;
  onReactionRemove: (messageId: string, emoji: string) => void;
  onReply?: (messageId: string) => void;
  onForward?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

const AdvancedMessageBubble = ({
  id,
  content,
  senderId,
  senderName,
  senderAvatar,
  timestamp,
  messageType = 'text',
  imageUrl,
  files = [],
  reactions = [],
  isOwn,
  readAt,
  onReactionAdd,
  onReactionRemove,
  onReply,
  onForward,
  onDelete
}: AdvancedMessageBubbleProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showActions, setShowActions] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const handleDownload = (file: MessageFile) => {
    // Simulate file download
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  const getMessageStatus = () => {
    if (!isOwn) return null;
    if (readAt) return 'read';
    return 'delivered';
  };

  const renderFileAttachment = (file: MessageFile) => {
    const isImage = file.type.startsWith('image/');
    
    if (isImage) {
      return (
        <div key={file.id} className="mt-2">
          <img
            src={file.url}
            alt={file.name}
            className="rounded max-w-xs cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(file.url, '_blank')}
          />
        </div>
      );
    }

    return (
      <div key={file.id} className="mt-2 p-3 border rounded-lg bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload(file)}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={senderAvatar} />
        <AvatarFallback className="text-xs">
          {senderName.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'text-right' : 'text-left'}`}>
        <div
          className={`rounded-lg px-3 py-2 relative ${
            isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {content && <p className="text-sm break-words">{content}</p>}
          
          {messageType === 'image' && imageUrl && (
            <img
              src={imageUrl}
              alt="Shared image"
              className="rounded mt-2 max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(imageUrl, '_blank')}
            />
          )}

          {files.map(renderFileAttachment)}

          {/* Message Actions */}
          {showActions && (
            <div className={`absolute top-0 ${isOwn ? 'left-0 -ml-10' : 'right-0 -mr-10'}`}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {onReply && (
                    <DropdownMenuItem onClick={() => onReply(id)}>
                      <Reply className="w-4 h-4 mr-2" />
                      Reply
                    </DropdownMenuItem>
                  )}
                  {onForward && (
                    <DropdownMenuItem onClick={() => onForward(id)}>
                      <Forward className="w-4 h-4 mr-2" />
                      Forward
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleCopy}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </DropdownMenuItem>
                  {isOwn && onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Reactions */}
        <MessageReactionsNew
          messageId={id}
          reactions={reactions}
          onReactionAdd={onReactionAdd}
          onReactionRemove={onReactionRemove}
        />

        {/* Message Info */}
        <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
          isOwn ? 'justify-end' : 'justify-start'
        }`}>
          <span>{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</span>
          {isOwn && (
            <MessageStatusIndicator 
              status={getMessageStatus() || 'sent'} 
              size={12}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedMessageBubble;
