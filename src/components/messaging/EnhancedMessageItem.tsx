
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Edit, Trash2, Reply, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import MessageReactionsDisplay from './MessageReactionsDisplay';

interface EnhancedMessageItemProps {
  message: any;
  isOwn: boolean;
  user: any;
  messageReactions: any[];
  threadCount: number;
  onReactionButtonClick: (event: React.MouseEvent, messageId: string) => void;
  onReplyToMessage: (message: any) => void;
  onReactionToggle: (messageId: string, emoji: string) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onDeleteMessage: (messageId: string) => void;
}

const EnhancedMessageItem = ({
  message,
  isOwn,
  user,
  messageReactions,
  threadCount,
  onReactionButtonClick,
  onReplyToMessage,
  onReactionToggle,
  onEditMessage,
  onDeleteMessage
}: EnhancedMessageItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || '');

  console.log('📝 EnhancedMessageItem - Rendering message:', {
    messageId: message.id,
    isOwn,
    isEditing,
    hasReactions: messageReactions.length > 0
  });

  const handleEditSave = () => {
    if (editContent.trim() && editContent !== message.content) {
      console.log('💾 EnhancedMessageItem - Saving edit:', { messageId: message.id, newContent: editContent });
      onEditMessage(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    console.log('❌ EnhancedMessageItem - Canceling edit:', message.id);
    setEditContent(message.content || '');
    setIsEditing(false);
  };

  const handleDelete = () => {
    console.log('🗑️ EnhancedMessageItem - Deleting message:', message.id);
    if (window.confirm('Are you sure you want to delete this message?')) {
      onDeleteMessage(message.id);
    }
  };

  const messageTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  return (
    <div className={`flex gap-3 p-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'text-right' : 'text-left'}`}>
        <div className="group relative">
          <div
            className={`rounded-lg px-3 py-2 ${
              isOwn
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {message.message_type === 'image' && message.image_url && (
              <img
                src={message.image_url}
                alt="Shared image"
                className="rounded mb-2 max-w-full h-auto"
              />
            )}
            
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="bg-background text-foreground"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSave();
                    if (e.key === 'Escape') handleEditCancel();
                  }}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleEditSave}>Save</Button>
                  <Button size="sm" variant="outline" onClick={handleEditCancel}>Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                {message.content && (
                  <p className="text-sm break-words">
                    {message.content}
                    {message.updated_at !== message.created_at && (
                      <span className="text-xs opacity-70 ml-2">(edited)</span>
                    )}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Message actions - only show on hover for own messages */}
          {isOwn && !isEditing && (
            <div className="absolute top-0 -right-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <MoreVertical size={12} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit size={12} className="mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 size={12} className="mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Message reactions */}
        {messageReactions.length > 0 && (
          <MessageReactionsDisplay
            reactions={messageReactions}
            onReactionToggle={(emoji) => onReactionToggle(message.id, emoji)}
          />
        )}

        {/* Message footer */}
        <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-muted-foreground">{messageTime}</span>
          
          {!isOwn && !isEditing && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => onReactionButtonClick(e, message.id)}
              >
                <Smile size={12} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => onReplyToMessage(message)}
              >
                <Reply size={12} />
              </Button>
            </div>
          )}
          
          {threadCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs"
              onClick={() => onReplyToMessage(message)}
            >
              {threadCount} {threadCount === 1 ? 'reply' : 'replies'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedMessageItem;
