
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Shield, Volume2, Play, Pause, Download, MoreVertical } from 'lucide-react';
import { useMessageEncryption } from '@/hooks/useMessageEncryption';
import MessageReactions from './MessageReactions';
import MessageStatusIndicator from './MessageStatusIndicator';
import { Message } from '@/types/messaging';

interface EnhancedMessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string;
  onAddReaction: (messageId: string, emoji: string) => void;
  onPlayVoice?: (voiceUrl: string) => void;
}

const EnhancedMessageBubble = ({
  message,
  isOwn,
  senderName,
  senderAvatar,
  onAddReaction,
  onPlayVoice
}: EnhancedMessageBubbleProps) => {
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { decryptMessage } = useMessageEncryption();

  // Decrypt message if encrypted
  useEffect(() => {
    if (message.is_encrypted && message.encrypted_content && message.encryption_key_id) {
      decryptMessage(message.encrypted_content, message.encryption_key_id).then(content => {
        setDecryptedContent(content);
      });
    }
  }, [message, decryptMessage]);

  const displayContent = message.is_encrypted ? decryptedContent : message.content;

  const handleVoicePlayback = () => {
    if (message.voice_url && onPlayVoice) {
      onPlayVoice(message.voice_url);
      setIsPlaying(!isPlaying);
    }
  };

  const getMessageStatus = () => {
    if (!isOwn) return null;
    if (message.read_at) return 'read';
    return 'delivered';
  };

  const messageTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  return (
    <div
      className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {!isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={senderAvatar} />
          <AvatarFallback className="text-xs">
            {senderName?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'text-right' : 'text-left'}`}>
        {/* Sender Name (for group chats) */}
        {!isOwn && senderName && (
          <p className="text-xs text-muted-foreground mb-1">{senderName}</p>
        )}

        {/* Message Bubble */}
        <div
          className={`rounded-lg px-3 py-2 ${
            isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {/* Encryption Indicator */}
          {message.is_encrypted && (
            <div className="flex items-center gap-1 mb-2">
              <Shield size={12} className="opacity-70" />
              <span className="text-xs opacity-70">Encrypted</span>
            </div>
          )}

          {/* Image Message */}
          {message.message_type === 'image' && message.image_url && (
            <div className="mb-2">
              <img
                src={message.image_url}
                alt="Shared image"
                className="rounded max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.image_url, '_blank')}
              />
            </div>
          )}

          {/* Voice Message */}
          {message.message_type === 'voice' && message.voice_url && (
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoicePlayback}
                className="h-8 w-8 p-0"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              </Button>
              <div className="flex-1">
                <div className="h-1 bg-muted-foreground/20 rounded">
                  <div className="h-1 bg-current rounded" style={{ width: '60%' }}></div>
                </div>
              </div>
              <Volume2 size={12} className="opacity-70" />
            </div>
          )}

          {/* Text Content */}
          {displayContent && (
            <p className="text-sm break-words">{displayContent}</p>
          )}

          {/* Loading indicator for encrypted messages */}
          {message.is_encrypted && !decryptedContent && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs opacity-70">Decrypting...</span>
            </div>
          )}
        </div>

        {/* Message Info & Actions */}
        <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-muted-foreground">{messageTime}</span>
          
          {/* Status Indicator for own messages */}
          {isOwn && (
            <MessageStatusIndicator 
              status={getMessageStatus() || 'sent'} 
              size={12}
            />
          )}

          {/* Quick Actions (visible on hover) */}
          {showActions && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <MoreVertical size={12} />
              </Button>
            </div>
          )}
        </div>

        {/* Reactions */}
        <MessageReactions
          messageId={message.id}
          reactions={message.reactions}
          onAddReaction={onAddReaction}
          currentUserId="current-user-id" // Replace with actual current user ID
        />
      </div>
    </div>
  );
};

export default EnhancedMessageBubble;
